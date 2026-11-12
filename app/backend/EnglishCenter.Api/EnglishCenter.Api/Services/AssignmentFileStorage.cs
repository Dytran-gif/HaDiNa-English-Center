namespace EnglishCenter.Api.Services;

// Lưu/xóa file bài tập + bài nộp trong wwwroot/uploads/AssignmentUploads.
// Chỉ nhận .pdf/.doc/.docx; tên file vật lý là Guid (không dùng tên gốc làm path, chống trùng + path traversal).
public static class AssignmentFileStorage
{
    public const long MaxBytes = 15 * 1024 * 1024;   // 15 MB
    public const string Folder = "AssignmentUploads";

    private static readonly HashSet<string> AllowedExt = new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".doc", ".docx" };

    public static bool IsAllowed(string? fileName) =>
        !string.IsNullOrWhiteSpace(fileName) && AllowedExt.Contains(Path.GetExtension(fileName));

    public static string ContentType(string fileName) => Path.GetExtension(fileName).ToLowerInvariant() switch
    {
        ".pdf" => "application/pdf",
        ".doc" => "application/msword",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        _ => "application/octet-stream"
    };

    private static string WwwRoot(IWebHostEnvironment env) =>
        env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");

    // .../wwwroot/uploads/AssignmentUploads (tạo nếu chưa có)
    public static string RootDir(IWebHostEnvironment env)
    {
        var dir = Path.Combine(WwwRoot(env), "uploads", Folder);
        Directory.CreateDirectory(dir);
        return dir;
    }

    // Trả về (tên gốc, đường dẫn tương đối /uploads/AssignmentUploads/{kind}/{guid.ext})
    public static async Task<(string FileName, string RelativePath)> SaveAsync(IWebHostEnvironment env, IFormFile file, string kind)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var name = $"{Guid.NewGuid():N}{ext}";
        var dir = Path.Combine(RootDir(env), kind);
        Directory.CreateDirectory(dir);
        await using (var stream = File.Create(Path.Combine(dir, name)))
            await file.CopyToAsync(stream);

        return (Path.GetFileName(file.FileName), $"/uploads/{Folder}/{kind}/{name}");
    }

    // Đường dẫn vật lý tuyệt đối; chỉ trả khi nằm trong thư mục AssignmentUploads (chặn ../).
    public static string? Resolve(IWebHostEnvironment env, string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath)) return null;
        var root = Path.GetFullPath(RootDir(env));
        var full = Path.GetFullPath(Path.Combine(WwwRoot(env), relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)));
        var rootPrefix = root.EndsWith(Path.DirectorySeparatorChar) ? root : root + Path.DirectorySeparatorChar;
        return full.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase) ? full : null;
    }

    // Xóa file cũ nếu hợp lệ và tồn tại. Không ném lỗi khi file không có.
    public static void Delete(IWebHostEnvironment env, string? relativePath)
    {
        var full = Resolve(env, relativePath);
        if (full != null && File.Exists(full)) File.Delete(full);
    }
}
