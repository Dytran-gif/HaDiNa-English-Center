using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController, Authorize(Roles = "admin"), Route("api/admin/profile")]
public class ProfileController(AppDbContext db, IWebHostEnvironment environment, ILogger<ProfileController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return user == null ? NotFound(new { message = "Không tìm thấy tài khoản." }) : Ok(ToResponse(user));
    }

    [HttpPut]
    public async Task<IActionResult> Update(AdminProfileInput input, CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });
        user.FullName = input.FullName.Trim();
        user.Phone = string.IsNullOrWhiteSpace(input.Phone) ? null : input.Phone.Trim();
        await db.SaveChangesAsync(ct);
        return Ok(ToResponse(user));
    }

    [HttpPost("avatar")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0 || file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "Ảnh phải có dung lượng từ 1 byte đến 5 MB." });
        await using var memory = new MemoryStream();
        await file.CopyToAsync(memory, ct);
        var bytes = memory.ToArray();
        var extension = DetectImage(bytes);
        if (extension == null || file.ContentType.ToLowerInvariant() != (extension == ".jpg" ? "image/jpeg" : extension == ".png" ? "image/png" : "image/webp"))
            return BadRequest(new { message = "Chỉ nhận ảnh JPG, PNG hoặc WebP hợp lệ." });
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });
        var directory = AvatarDirectory(id);
        Directory.CreateDirectory(directory);
        var filename = Guid.NewGuid().ToString("N") + extension;
        var path = Path.Combine(directory, filename);
        var oldUrl = user.AvatarUrl;
        try
        {
            await using (var output = new FileStream(path, FileMode.CreateNew, FileAccess.Write))
                await output.WriteAsync(bytes, ct);
            user.AvatarUrl = $"/uploads/admin-avatars/{id}/{filename}";
            await db.SaveChangesAsync(ct);
        }
        catch { TryDelete(path); throw; }
        DeleteOldAvatar(id, oldUrl);
        return Ok(ToResponse(user));
    }

    [HttpDelete("avatar")]
    public async Task<IActionResult> RemoveAvatar(CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });
        var oldUrl = user.AvatarUrl;
        user.AvatarUrl = null;
        await db.SaveChangesAsync(ct);
        DeleteOldAvatar(id, oldUrl);
        return Ok(ToResponse(user));
    }

    private string AvatarDirectory(int id) => Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads", "admin-avatars", id.ToString());
    private void DeleteOldAvatar(int id, string? url)
    {
        var prefix = $"/uploads/admin-avatars/{id}/";
        if (url == null || !url.StartsWith(prefix, StringComparison.Ordinal)) return;
        var filename = url[prefix.Length..];
        if (filename != Path.GetFileName(filename) || !Guid.TryParseExact(Path.GetFileNameWithoutExtension(filename), "N", out _) || !new[] { ".jpg", ".png", ".webp" }.Contains(Path.GetExtension(filename))) return;
        TryDelete(Path.Combine(AvatarDirectory(id), filename));
    }
    private void TryDelete(string path)
    {
        try { System.IO.File.Delete(path); }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { logger.LogWarning("Could not remove an unused Admin avatar file."); }
    }
    private static string? DetectImage(byte[] b)
    {
        if (b.Length >= 24 && b.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) && b.AsSpan(12, 4).SequenceEqual("IHDR"u8)) return ".png";
        if (b.Length >= 4 && b[0] == 255 && b[1] == 216 && b[2] == 255) return ".jpg";
        if (b.Length >= 16 && b.AsSpan(0, 4).SequenceEqual("RIFF"u8) && b.AsSpan(8, 4).SequenceEqual("WEBP"u8)) return ".webp";
        return null;
    }
    private static object ToResponse(User u) => new { userId = u.Id, u.FullName, u.Phone, u.Email, u.Role, u.AvatarUrl };
}
