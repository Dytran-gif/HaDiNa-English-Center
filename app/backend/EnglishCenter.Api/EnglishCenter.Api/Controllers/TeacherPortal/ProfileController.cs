using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.TeacherPortal;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Hồ sơ. Thông tin do Admin quản lý, giáo viên chỉ xem (trừ ảnh đại diện và mật khẩu).
[Route("api/teacher/profile")]
public class ProfileController : TeacherControllerBase
{
    private readonly TokenService _tokens;
    private readonly FileStorageService _files;

    public ProfileController(AppDbContext db, TokenService tokens, FileStorageService files) : base(db)
    {
        _tokens = tokens;
        _files = files;
    }

    // GET api/teacher/profile
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var t = await Db.Teachers.AsNoTracking().Where(x => x.Id == TeacherId)
            .Select(x => new
            {
                x.Id, x.FullName, x.User.Email, x.Phone, x.Specialty, x.Degree, x.HireDate, x.Status,
                x.User.AvatarUrl,
                ClassCount = x.Classes.Count()
            })
            .FirstAsync();
        return Ok(t);
    }

    // POST api/teacher/profile/avatar  (multipart, field "file": ảnh jpg/png/webp ≤ 5 MB)
    [HttpPost("avatar")]
    [RequestSizeLimit(FileStorageService.MaxBytes)]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var error = FileStorageService.Validate(file, "avatars");
        if (error != null) return Error(400, error);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp"))
            return Error(400, "Ảnh đại diện phải là jpg, png hoặc webp");
        if (file.Length > 5 * 1024 * 1024) return Error(400, "Ảnh đại diện tối đa 5 MB");

        var saved = await _files.SaveAsync(file, "avatars");
        var user = await Db.Users.FirstAsync(u => u.Id == UserId);
        user.AvatarUrl = saved.Url;
        await Db.SaveChangesAsync();
        return Ok(new { avatarUrl = user.AvatarUrl });
    }

    // POST api/teacher/profile/change-password
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(TeacherChangePasswordRequest req)
    {
        var user = await Db.Users.FirstAsync(u => u.Id == UserId);
        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return Error(400, "Mật khẩu hiện tại không đúng");
        if (req.CurrentPassword == req.NewPassword)
            return Error(400, "Mật khẩu mới phải khác mật khẩu hiện tại");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.TokenVersion++;   // các phiên đăng nhập khác bị đăng xuất
        await Db.SaveChangesAsync();

        // Trả token mới để giáo viên không bị đá ra khỏi phiên hiện tại
        return Ok(new { message = "Đổi mật khẩu thành công", token = _tokens.CreateToken(user) });
    }

    // POST api/teacher/profile/logout - tăng TokenVersion để token hiện tại hết hiệu lực
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var user = await Db.Users.FirstAsync(u => u.Id == UserId);
        user.TokenVersion++;
        await Db.SaveChangesAsync();
        return Ok(new { message = "Đã đăng xuất" });
    }
}
