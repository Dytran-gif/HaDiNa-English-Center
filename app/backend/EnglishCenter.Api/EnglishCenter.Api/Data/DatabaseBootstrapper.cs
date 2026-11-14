using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Data;

// Tự dựng database khi chạy API ở máy dev: git pull -> dotnet run là có DB đủ bảng + dữ liệu,
// KHÔNG cần chạy dotnet ef / restore tay / script PowerShell.
//
// Mỗi lần khởi động (chỉ làm phần còn thiếu, chạy lại bao nhiêu lần cũng được):
//   1. Máy CHƯA có DB: restore từ tools/db/EnglishCenterDb.bak (DB chung của nhóm, có sẵn dữ liệu).
//      Restore không được (SQL Server cũ hơn bản tạo backup, không có quyền đọc file...) thì để EF tạo DB trống.
//   2. Sửa DB cũ để EF không lỗi (DB tạo tay chưa ghi migration; bảng Assignments/Attendances kiểu Teacher cũ)
//   3. Áp các migration còn thiếu (chỉ THÊM bảng/cột, không xóa dữ liệu)
//   4. DB chưa có user nào thì seed tài khoản demo (admin/teacher/student@demo.com, mật khẩu 123456)
//
// Cấu hình (appsettings / dòng lệnh):
//   Database:AutoSetup   mặc định true ở Development, false ở môi trường khác
//   Database:BackupFile  đường dẫn file .bak khác (mặc định tools/db/EnglishCenterDb.bak)
//   Tắt: dotnet run -- --Database:AutoSetup=false
public static class DatabaseBootstrapper
{
    private const string InitialCreate = "20261019064930_InitialCreate";
    private const string EfVersion = "10.0.13";
    private static readonly string DefaultBackup = Path.Combine("tools", "db", "EnglishCenterDb.bak");

    public static async Task RunAsync(WebApplication app)
    {
        var cfg = app.Configuration;
        // InitializeOnStartup: tên cũ của cờ này, vẫn nhận để không phá script cũ
        var enabled = cfg.GetValue<bool?>("Database:AutoSetup")
                      ?? cfg.GetValue<bool?>("Database:InitializeOnStartup")
                      ?? app.Environment.IsDevelopment();
        if (!enabled) return;

        var log = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseSetup");
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        try
        {
            if (!await db.Database.CanConnectAsync())
                await TryRestoreBackupAsync(db, app.Environment, cfg["Database:BackupFile"], log);

            await RepairLegacyAsync(db, log);

            var pending = (await db.Database.GetPendingMigrationsAsync()).ToList();
            if (pending.Count > 0)
            {
                log.LogInformation("Database: áp {n} migration còn thiếu: {list}", pending.Count, string.Join(", ", pending));
                await db.Database.MigrateAsync();
            }

            await DbSeeder.SeedAsync(db);
            log.LogInformation("Database sẵn sàng ({db}).", db.Database.GetDbConnection().Database);
        }
        catch (Exception ex)
        {
            log.LogError(ex,
                "Không tự dựng được database. Kiểm tra SQL Server đang chạy và ConnectionStrings:Default trong appsettings.json.");
            throw;
        }
    }

    // ---------- 1. Restore file backup chung ----------
    private static async Task TryRestoreBackupAsync(AppDbContext db, IWebHostEnvironment env, string? configured, ILogger log)
    {
        var bak = !string.IsNullOrWhiteSpace(configured)
            ? Path.GetFullPath(configured, env.ContentRootPath)
            : FindUp(env.ContentRootPath, DefaultBackup);
        if (bak == null || !File.Exists(bak))
        {
            log.LogWarning("Database: chưa có DB và không thấy file {bak}. EF sẽ tạo DB trống + tài khoản demo.", DefaultBackup);
            return;
        }

        var csb = new SqlConnectionStringBuilder(db.Database.GetConnectionString());
        var dbName = string.IsNullOrEmpty(csb.InitialCatalog) ? "EnglishCenterDb" : csb.InitialCatalog;
        csb.InitialCatalog = "master";

        try
        {
            await using var conn = new SqlConnection(csb.ConnectionString);
            await conn.OpenAsync();

            if (Convert.ToInt32(await ScalarAsync(conn, "SELECT COUNT(*) FROM sys.databases WHERE name = @p0", dbName)) > 0)
                return; // DB có rồi nhưng không mở được (quyền...) -> để EF báo lỗi rõ ràng

            log.LogInformation("Database: máy chưa có {db}, đang restore từ {bak}", dbName, bak);

            // Tài khoản chạy SQL Server thường không đọc được thư mục của user -> thử bản chép ra thư mục Public
            var source = bak;
            DataTable files;
            try { files = await TableAsync(conn, "RESTORE FILELISTONLY FROM DISK = @p0", source); }
            catch (SqlException ex) when (ex.Message.Contains("Operating system error 5") || ex.Message.Contains("Access is denied"))
            {
                var pub = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonDocuments), "EnglishCenterDb.bak");
                File.Copy(bak, pub, overwrite: true);
                source = pub;
                files = await TableAsync(conn, "RESTORE FILELISTONLY FROM DISK = @p0", source);
            }

            var paths = await TableAsync(conn,
                "SELECT CAST(SERVERPROPERTY('InstanceDefaultDataPath') AS nvarchar(400)) AS D, CAST(SERVERPROPERTY('InstanceDefaultLogPath') AS nvarchar(400)) AS L");
            var dataDir = (string)paths.Rows[0]["D"];
            var logDir = (string)paths.Rows[0]["L"];

            var moves = new List<string>();
            var args = new List<object> { source };
            foreach (DataRow f in files.Rows)
            {
                var isLog = (string)f["Type"] == "L";
                var target = Path.Combine(isLog ? logDir : dataDir, isLog ? $"{dbName}_log.ldf" : $"{dbName}.mdf");
                moves.Add($"MOVE @p{args.Count} TO @p{args.Count + 1}");
                args.Add((string)f["LogicalName"]);
                args.Add(target);
            }

            await ExecAsync(conn,
                $"RESTORE DATABASE {Quote(dbName)} FROM DISK = @p0 WITH {string.Join(", ", moves)}, RECOVERY",
                args.ToArray());
            try { await ExecAsync(conn, $"ALTER AUTHORIZATION ON DATABASE::{Quote(dbName)} TO [sa]"); }
            catch { /* không đổi được chủ sở hữu thì bỏ qua */ }

            log.LogInformation("Database: đã restore {db} từ file backup của nhóm.", dbName);
        }
        catch (SqlException ex)
        {
            var hint = ex.Message.Contains("version") || ex.Message.Contains("phiên bản")
                ? " File backup tạo từ SQL Server 2025; máy dùng bản cũ hơn thì không restore được."
                : "";
            log.LogWarning("Database: không restore được file backup ({msg}).{hint} EF sẽ tạo DB trống + tài khoản demo.",
                ex.Message, hint);
        }
        finally
        {
            SqlConnection.ClearAllPools(); // tránh giữ kết nối tới DB chưa tồn tại lúc nãy
        }
    }

    // ---------- 2. Sửa DB cũ ----------
    private static async Task RepairLegacyAsync(AppDbContext db, ILogger log)
    {
        if (!await db.Database.CanConnectAsync()) return; // DB chưa có -> MigrateAsync sẽ tạo mới

        // Máy từng chạy migration TeacherFeatures (đã bỏ): bảng "Assignments" / "Attendances" đang là kiểu Teacher cũ.
        // Đổi tên sang <Bảng>_TeacherOld (giữ dữ liệu) để nhường tên cho bảng cùng tên của bản hiện tại.
        await RenameLegacyTableAsync(db, log, "Assignments",
            "COL_LENGTH(N'dbo.Assignments', N'ClassId') IS NOT NULL AND COL_LENGTH(N'dbo.Assignments', N'FileType') IS NULL");
        await RenameLegacyTableAsync(db, log, "Attendances",
            "COL_LENGTH(N'dbo.Attendances', N'SessionId') IS NOT NULL AND COL_LENGTH(N'dbo.Attendances', N'Date') IS NULL");

        // DB tạo tay: có bảng Users nhưng EF chưa ghi nhận InitialCreate -> ghi nhận để EF không tạo lại bảng
        var marked = await ScalarAsync(db, $@"
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
BEGIN
    IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL
        CREATE TABLE dbo.__EFMigrationsHistory (MigrationId nvarchar(150) NOT NULL PRIMARY KEY, ProductVersion nvarchar(32) NOT NULL);
    IF NOT EXISTS (SELECT 1 FROM dbo.__EFMigrationsHistory WHERE MigrationId = N'{InitialCreate}')
    BEGIN
        INSERT INTO dbo.__EFMigrationsHistory (MigrationId, ProductVersion) VALUES (N'{InitialCreate}', N'{EfVersion}');
        SELECT 1; RETURN;
    END
END
SELECT 0;");
        if (Convert.ToInt32(marked) == 1)
            log.LogWarning("Database: DB tạo tay -> đã ghi nhận {id} là đã áp.", InitialCreate);
    }

    // Đổi tên bảng kiểu cũ (kèm PK/FK/CHECK/index có tên bảng) sang <table>_TeacherOld khi điều kiện đúng
    private static async Task RenameLegacyTableAsync(AppDbContext db, ILogger log, string table, string condition)
    {
        var renamed = await ScalarAsync(db, $@"
IF {condition}
BEGIN
    DECLARE @old sysname = N'{table}';
    DECLARE @new sysname = @old + N'_TeacherOld';
    IF OBJECT_ID(N'dbo.' + @new, N'U') IS NOT NULL
        SET @new = @new + N'_' + FORMAT(SYSDATETIME(), 'yyyyMMddHHmmss');
    DECLARE @src nvarchar(300) = N'dbo.' + @old;
    EXEC sp_rename @src, @new;

    DECLARE @name sysname, @to sysname, @full nvarchar(400);
    DECLARE c CURSOR LOCAL FAST_FORWARD FOR
        SELECT name FROM sys.objects
        WHERE parent_object_id = OBJECT_ID(N'dbo.' + @new) AND name LIKE N'%' + @old + N'%';
    OPEN c; FETCH NEXT FROM c INTO @name;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @to = REPLACE(@name, @old, @new); SET @full = N'dbo.' + QUOTENAME(@name);
        EXEC sp_rename @full, @to, N'OBJECT';
        FETCH NEXT FROM c INTO @name;
    END;
    CLOSE c; DEALLOCATE c;

    DECLARE i CURSOR LOCAL FAST_FORWARD FOR
        SELECT name FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.' + @new) AND name LIKE N'%' + @old + N'%'
          AND is_primary_key = 0 AND is_unique_constraint = 0;
    OPEN i; FETCH NEXT FROM i INTO @name;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @to = REPLACE(@name, @old, @new); SET @full = N'dbo.' + QUOTENAME(@new) + N'.' + QUOTENAME(@name);
        EXEC sp_rename @full, @to, N'INDEX';
        FETCH NEXT FROM i INTO @name;
    END;
    CLOSE i; DEALLOCATE i;
    SELECT @new;
END
ELSE SELECT CAST(NULL AS sysname);");
        if (renamed is string r)
            log.LogWarning("Database: bảng {table} kiểu Teacher cũ (đã bỏ) được đổi tên thành {name}, giữ nguyên dữ liệu.", table, r);
    }

    private static string? FindUp(string start, string relative)
    {
        for (var dir = new DirectoryInfo(start); dir != null; dir = dir.Parent)
        {
            var candidate = Path.Combine(dir.FullName, relative);
            if (File.Exists(candidate)) return candidate;
        }
        return null;
    }

    private static string Quote(string name) => "[" + name.Replace("]", "]]") + "]";

    // ---------- ADO helpers ----------
    private static async Task<object?> ScalarAsync(AppDbContext db, string sql)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync();
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        var v = await cmd.ExecuteScalarAsync();
        return v is DBNull ? null : v;
    }

    private static SqlCommand Command(SqlConnection conn, string sql, object[] args)
    {
        var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.CommandTimeout = 600;
        for (var i = 0; i < args.Length; i++) cmd.Parameters.AddWithValue($"@p{i}", args[i]);
        return cmd;
    }

    private static async Task<object?> ScalarAsync(SqlConnection conn, string sql, params object[] args)
    {
        await using var cmd = Command(conn, sql, args);
        return await cmd.ExecuteScalarAsync();
    }

    private static async Task ExecAsync(SqlConnection conn, string sql, params object[] args)
    {
        await using var cmd = Command(conn, sql, args);
        await cmd.ExecuteNonQueryAsync();
    }

    private static async Task<DataTable> TableAsync(SqlConnection conn, string sql, params object[] args)
    {
        await using var cmd = Command(conn, sql, args);
        await using var reader = await cmd.ExecuteReaderAsync();
        var t = new DataTable();
        t.Load(reader);
        return t;
    }
}
