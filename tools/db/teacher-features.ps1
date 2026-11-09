<#
  teacher-features.ps1 - Tao + ap migration TeacherFeatures cho EnglishCenterDB (plan 00)

  CHI MOT NGUOI CHAY, roi commit thu muc Migrations/ cho ca nhom.
  Nguoi khac chi can: git pull  ->  dotnet ef database update

  Script lam:
    1. Kiem tra dotnet + dotnet-ef (thieu dotnet-ef thi tu cai)
    2. Doc chuoi ket noi tu appsettings.json (+ appsettings.Development.json neu co)
    3. Kiem tra DB: neu bang Users da co ma __EFMigrationsHistory chua ghi InitialCreate
       (DB tao tay) thi danh dau InitialCreate da ap, de EF khong tao lai bang cu
    4. dotnet ef migrations add TeacherFeatures (neu chua co)
    5. Soat file migration: chan neu co DropTable / DropColumn / Rename... tren bang cu
    6. Hoi xac nhan -> dotnet ef database update
    7. Kiem tra bang ClassSessions da ton tai
    8. (tuy chon -SeedDemo) chay seed du lieu demo cho teacher@demo.com

  Neu may CHUA co database EnglishCenterDb:
    - co file tools\db\EnglishCenterDb.bak -> script hoi de restore truoc (goi restore-db.ps1)
    - hoac -CreateFresh -> de EF tao DB moi (InitialCreate + TeacherFeatures) roi seed demo

  Chay (PowerShell, tu goc repo):
    powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1
    powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -SeedDemo
    powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -CreateFresh -SeedDemo
#>
param(
    [switch]$SeedDemo,
    [switch]$CreateFresh, # DB chua ton tai -> de EF tao moi (khong restore backup)
    [switch]$Yes          # bo qua cau hoi xac nhan
)

$ErrorActionPreference = "Stop"
$MigrationName = "TeacherFeatures"
$InitialId     = "20261019064930_InitialCreate"
$EfVersion     = "10.0.13"
$OldTables     = @("CenterSettings","ClassSchedules","Classes","Courses","Enrollments","HomepageImages",
                   "Payments","Posts","Rooms","Students","Teachers","Users")

function Step($t) { Write-Host ""; Write-Host "==> $t" -ForegroundColor Cyan }
function Ok($t)   { Write-Host "    [OK] $t" -ForegroundColor Green }
function Warn($t) { Write-Host "    [!]  $t" -ForegroundColor Yellow }
function Fail($t) { Write-Host "    [X]  $t" -ForegroundColor Red; exit 1 }
function Confirm($q) {
    if ($Yes) { return $true }
    $a = Read-Host "    $q (y/N)"
    return ($a -eq "y" -or $a -eq "Y")
}

# ---------- 0. Duong dan ----------
$RepoRoot   = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ProjectDir = Join-Path $RepoRoot "app\backend\EnglishCenter.Api\EnglishCenter.Api"
if (-not (Test-Path (Join-Path $ProjectDir "EnglishCenter.Api.csproj"))) { Fail "Khong thay EnglishCenter.Api.csproj o $ProjectDir" }
Set-Location $ProjectDir
Write-Host "Project: $ProjectDir"

# ---------- 1. Cong cu ----------
Step "Kiem tra dotnet / dotnet-ef"
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) { Fail "Chua cai .NET SDK 10 (https://dotnet.microsoft.com/download)" }
Ok ("dotnet " + (dotnet --version))
$efOk = $true
try { dotnet ef --version *> $null; if ($LASTEXITCODE -ne 0) { $efOk = $false } } catch { $efOk = $false }
if (-not $efOk) {
    Warn "Chua co dotnet-ef, dang cai..."
    dotnet tool install --global dotnet-ef
    if ($LASTEXITCODE -ne 0) { Fail "Cai dotnet-ef that bai" }
    $env:PATH = "$env:PATH;$env:USERPROFILE\.dotnet\tools"
}
Ok "dotnet-ef san sang"

# ---------- 2. Chuoi ket noi ----------
Step "Doc chuoi ket noi"
$conn = (Get-Content "appsettings.json" -Raw | ConvertFrom-Json).ConnectionStrings.Default
if (Test-Path "appsettings.Development.json") {
    $dev = Get-Content "appsettings.Development.json" -Raw | ConvertFrom-Json
    if ($dev.ConnectionStrings -and $dev.ConnectionStrings.Default) { $conn = $dev.ConnectionStrings.Default; Ok "Dung chuoi trong appsettings.Development.json" }
}
if (-not $conn) { Fail "Khong thay ConnectionStrings:Default" }
Write-Host "    $conn"

function Sql-Scalar($sql) {
    $c = New-Object System.Data.SqlClient.SqlConnection $conn
    $c.Open()
    try { $cmd = $c.CreateCommand(); $cmd.CommandText = $sql; return $cmd.ExecuteScalar() } finally { $c.Close() }
}
function Sql-Exec($sql) {
    $c = New-Object System.Data.SqlClient.SqlConnection $conn
    $c.Open()
    try { $cmd = $c.CreateCommand(); $cmd.CommandText = $sql; [void]$cmd.ExecuteNonQuery() } finally { $c.Close() }
}

# ---------- 3. Trang thai DB ----------
Step "Kiem tra trang thai DB"
# Doc / doi chuoi ket noi bang regex (SqlConnectionStringBuilder bi PowerShell coi la dictionary nen khong dung duoc)
function Get-ConnPart([string]$cs, [string[]]$names) {
    foreach ($n in $names) {
        $m = [regex]::Match($cs, "(?i)(?:^|;)\s*$n\s*=\s*([^;]*)")
        if ($m.Success) { return $m.Groups[1].Value.Trim() }
    }
    return ""
}
function Set-ConnDatabase([string]$cs, [string]$db) {
    $re = '(?i)(^|;)\s*(Database|Initial Catalog)\s*=\s*[^;]*'
    if ([regex]::IsMatch($cs, $re)) { return [regex]::Replace($cs, $re, '${1}Database=' + $db) }
    return $cs.TrimEnd(';') + ";Database=$db"
}
$server = Get-ConnPart $conn @("Server", "Data Source", "Address", "Addr")
$dbName = Get-ConnPart $conn @("Database", "Initial Catalog")
$masterConn = Set-ConnDatabase $conn "master"
try {
    $mc = New-Object System.Data.SqlClient.SqlConnection $masterConn
    $mc.Open()
    try { $cmd = $mc.CreateCommand(); $cmd.CommandText = "SELECT COUNT(*) FROM sys.databases WHERE name = N'$dbName'"; $dbExists = [int]$cmd.ExecuteScalar() -gt 0 }
    finally { $mc.Close() }
} catch { Fail "Khong ket noi duoc SQL Server ($server): $($_.Exception.Message)" }

$fresh = $false
if (-not $dbExists) {
    Warn "Database '$dbName' CHUA TON TAI tren $server."
    $bak = Join-Path $PSScriptRoot "EnglishCenterDb.bak"
    if (-not $CreateFresh -and (Test-Path $bak) -and (Confirm "Restore tu $bak truoc (giu du lieu demo cua nhom)?")) {
        $global:LASTEXITCODE = 0
        & (Join-Path $PSScriptRoot "restore-db.ps1") -BackupFile $bak -Yes:$Yes
        if ($LASTEXITCODE -ne 0) { Fail "Restore that bai. Co the chay lai voi -CreateFresh de EF tao DB moi." }
        Set-Location $ProjectDir
    } elseif ($CreateFresh -or (Confirm "Tao DB moi bang EF (InitialCreate + TeacherFeatures) va seed du lieu demo?")) {
        $fresh = $true
        $SeedDemo = $true
        Ok "Se de EF tao database moi o buoc 6"
    } else { Fail "Dung theo yeu cau." }
}

if (-not $fresh) {
try { $dbName = Sql-Scalar "SELECT DB_NAME()" } catch { Fail "Khong ket noi duoc database: $($_.Exception.Message)" }
Ok "Da ket noi database: $dbName"

$hasUsers    = [int](Sql-Scalar "SELECT CASE WHEN OBJECT_ID(N'dbo.Users', N'U') IS NULL THEN 0 ELSE 1 END")
$hasHistory  = [int](Sql-Scalar "SELECT CASE WHEN OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL THEN 0 ELSE 1 END")
$hasSessions = [int](Sql-Scalar "SELECT CASE WHEN OBJECT_ID(N'dbo.ClassSessions', N'U') IS NULL THEN 0 ELSE 1 END")
$hasInitial  = 0
if ($hasHistory -eq 1) {
    $hasInitial = [int](Sql-Scalar "SELECT COUNT(*) FROM dbo.__EFMigrationsHistory WHERE MigrationId = N'$InitialId'")
}
Write-Host "    Users: $hasUsers | __EFMigrationsHistory: $hasHistory | InitialCreate da ghi: $hasInitial | ClassSessions: $hasSessions"

if ($hasSessions -eq 1) { Warn "Bang ClassSessions DA TON TAI. Co the migration da duoc ap roi. Script se van kiem tra va update (EF bo qua neu da ap)." }

if ($hasUsers -eq 1 -and $hasInitial -eq 0) {
    Warn "DB co bang cu nhung CHUA ghi nhan InitialCreate (DB tao tay)."
    Warn "Neu khong danh dau, EF se co tao lai bang Users va bao loi."
    if (-not (Confirm "Danh dau $InitialId la da ap?")) { Fail "Dung theo yeu cau." }
    Sql-Exec @"
IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NULL
    CREATE TABLE dbo.__EFMigrationsHistory (MigrationId nvarchar(150) NOT NULL PRIMARY KEY, ProductVersion nvarchar(32) NOT NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.__EFMigrationsHistory WHERE MigrationId = N'$InitialId')
    INSERT INTO dbo.__EFMigrationsHistory (MigrationId, ProductVersion) VALUES (N'$InitialId', N'$EfVersion');
"@
    Ok "Da danh dau InitialCreate"
}
}

# ---------- 4. Tao migration ----------
Step "Tao migration $MigrationName"
$existing = Get-ChildItem "Migrations" -Filter "*_$MigrationName.cs" -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "*.Designer.cs" }
if ($existing) {
    Ok "Da co san: $($existing.Name) (khong tao lai)"
    $migFile = $existing.FullName
} else {
    dotnet ef migrations add $MigrationName
    if ($LASTEXITCODE -ne 0) { Fail "dotnet ef migrations add that bai (xem loi build o tren)" }
    $migFile = (Get-ChildItem "Migrations" -Filter "*_$MigrationName.cs" | Where-Object { $_.Name -notlike "*.Designer.cs" }).FullName
    Ok "Da tao: $(Split-Path $migFile -Leaf)"
}

# ---------- 5. Soat migration ----------
Step "Soat noi dung migration"
$code = Get-Content $migFile -Raw
$up   = $code.Split(@("protected override void Down"), [StringSplitOptions]::None)[0]
$created = [regex]::Matches($up, 'CreateTable\(\s*name:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
$added   = [regex]::Matches($up, 'AddColumn<[^>]+>\(\s*name:\s*"([^"]+)",\s*table:\s*"([^"]+)"') | ForEach-Object { "$($_.Groups[2].Value).$($_.Groups[1].Value)" }
Write-Host ("    Tao bang ({0}): {1}" -f $created.Count, ($created -join ", "))
if ($added) { Write-Host ("    Them cot: {0}" -f ($added -join ", ")) }

$danger = [regex]::Matches($up, '(DropTable|DropColumn|RenameTable|RenameColumn|AlterColumn|DropForeignKey|DropIndex)\s*\(\s*(?:name:\s*"([^"]+)")?[^)]*?table:\s*"([^"]+)"') |
          Where-Object { $OldTables -contains $_.Groups[3].Value } |
          ForEach-Object { "$($_.Groups[1].Value) tren $($_.Groups[3].Value)" }
$dropOld = [regex]::Matches($up, 'DropTable\(\s*name:\s*"([^"]+)"') | Where-Object { $OldTables -contains $_.Groups[1].Value } | ForEach-Object { "DropTable $($_.Groups[1].Value)" }
$recreate = $created | Where-Object { $OldTables -contains $_ }
$problems = @($danger) + @($dropOld) + @($recreate | ForEach-Object { "CreateTable lai bang cu $_" }) | Where-Object { $_ }
if ($problems.Count -gt 0) {
    Warn "Migration dong vao bang cu theo cach co the mat du lieu:"
    $problems | ForEach-Object { Warn "   - $_" }
    Fail "Dung lai. Mo file $(Split-Path $migFile -Leaf) kiem tra bang tay, hoac xoa migration (dotnet ef migrations remove) roi bao nhom."
}
Ok "Khong co thao tac xoa/doi ten tren bang cu"

# ---------- 6. Ap vao DB ----------
Step "Ap migration vao $dbName"
if (-not (Confirm "Chay 'dotnet ef database update' tren $dbName?")) { Warn "Bo qua update. Migration da tao, chua ap."; exit 0 }
dotnet ef database update
if ($LASTEXITCODE -ne 0) { Fail "dotnet ef database update that bai" }

# ---------- 7. Kiem tra ----------
Step "Kiem tra sau khi ap"
$after = [int](Sql-Scalar "SELECT CASE WHEN OBJECT_ID(N'dbo.ClassSessions', N'U') IS NULL THEN 0 ELSE 1 END")
if ($after -ne 1) { Fail "Van chua thay bang ClassSessions" }
$tableCount = Sql-Scalar "SELECT COUNT(*) FROM sys.tables WHERE name <> '__EFMigrationsHistory'"
Ok "ClassSessions da co. Tong so bang: $tableCount"

# ---------- 8. Seed demo (tuy chon) ----------
if ($SeedDemo) {
    Step "Seed du lieu demo cho teacher@demo.com"
    $teacher = [int](Sql-Scalar "SELECT COUNT(*) FROM dbo.Teachers t JOIN dbo.Users u ON u.Id = t.UserId WHERE u.Email = N'teacher@demo.com'")
    if ($teacher -eq 0) { Warn "DB khong co teacher@demo.com nen TeacherSeeder se bo qua phan demo." }
    Warn "API se khoi dong voi Database:InitializeOnStartup=true. Thay dong 'Now listening on' thi bam Ctrl+C."
    Warn "DbSeeder chi tao tai khoan khi DB CHUA co user nao, nen khong nhan doi du lieu."
    dotnet run --launch-profile http -- --Database:InitializeOnStartup=true
}

Write-Host ""
Write-Host "XONG. Viec tiep theo:" -ForegroundColor Green
Write-Host "  1. git add app/backend/EnglishCenter.Api/EnglishCenter.Api/Migrations"
Write-Host "  2. git commit -m `"feat(be): add TeacherFeatures migration`""
Write-Host "  3. git push  ->  bao nhom: git pull roi dotnet ef database update"
