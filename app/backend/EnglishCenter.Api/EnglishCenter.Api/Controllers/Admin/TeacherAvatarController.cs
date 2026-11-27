using EnglishCenter.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController, Authorize(Roles = "admin"), Route("api/admin/teachers/{id:int}/avatar")]
public class TeacherAvatarController(AppDbContext db, IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost, RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> Upload(int id, IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0 || file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "Chọn ảnh JPG, PNG hoặc WebP không quá 5 MB." });
        var teacher = await db.Teachers.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == id, ct);
        if (teacher == null) return NotFound(new { message = "Không tìm thấy giáo viên." });
        await using var buffer = new MemoryStream();
        await file.CopyToAsync(buffer, ct);
        var bytes = buffer.ToArray();
        var extension = Detect(bytes);
        if (extension == null || file.ContentType.ToLowerInvariant() != (extension == ".jpg" ? "image/jpeg" : extension == ".png" ? "image/png" : "image/webp"))
            return BadRequest(new { message = "File ảnh không hợp lệ. Chỉ nhận JPG, PNG hoặc WebP." });
        var directory = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads", "teacher-avatars", id.ToString());
        Directory.CreateDirectory(directory);
        var filename = Guid.NewGuid().ToString("N") + extension;
        var path = Path.Combine(directory, filename);
        try
        {
            await System.IO.File.WriteAllBytesAsync(path, bytes, ct);
            teacher.User.AvatarUrl = $"/uploads/teacher-avatars/{id}/{filename}";
            await db.SaveChangesAsync(ct);
        }
        catch { System.IO.File.Delete(path); throw; }
        // Older files may still be referenced by a portal/browser; leave their cleanup to storage maintenance.
        return Ok(new { avatarUrl = teacher.User.AvatarUrl });
    }
    private static string? Detect(byte[] b)
    {
        if (b.Length >= 24 && b.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) && b.AsSpan(12, 4).SequenceEqual("IHDR"u8)) return ".png";
        if (b.Length >= 4 && b[0] == 255 && b[1] == 216 && b[2] == 255) return ".jpg";
        if (b.Length >= 16 && b.AsSpan(0, 4).SequenceEqual("RIFF"u8) && b.AsSpan(8, 4).SequenceEqual("WEBP"u8)) return ".webp";
        return null;
    }
}
