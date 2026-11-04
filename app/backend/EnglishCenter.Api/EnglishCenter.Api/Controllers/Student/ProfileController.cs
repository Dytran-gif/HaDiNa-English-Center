using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Hồ sơ học viên: xem thông tin của chính mình + đổi mật khẩu.
// Đổi mật khẩu làm TokenVersion tăng -> token cũ mất hiệu lực, trả token mới.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public ProfileController(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    // GET api/student/profile
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var row = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => new
            {
                s.Code,
                s.FullName,
                s.User.Email,
                s.User.Role,
                s.User.AvatarUrl,
                s.Phone,
                s.DateOfBirth,
                s.Address,
                s.ParentName,
                s.ParentPhone,
                // ⚠️ DB CHƯA CÓ cột Students.TargetBand (migration chưa chạy) -> tạm trả null.
                // KHI THÊM CỘT: bỏ dòng này và chọn s.TargetBand.
                TargetBand = (decimal?)null
            })
            .FirstOrDefaultAsync();

        if (row == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        return Ok(new StudentProfileResponse
        {
            Code = row.Code,
            FullName = row.FullName,
            Email = row.Email,
            Role = row.Role,
            AvatarUrl = row.AvatarUrl,
            Phone = row.Phone,
            DateOfBirth = row.DateOfBirth,
            Address = row.Address,
            ParentName = row.ParentName,
            ParentPhone = row.ParentPhone,
            TargetBand = row.TargetBand
        });
    }

    // POST api/student/profile/change-password - body { currentPassword, newPassword, confirmPassword }
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(StudentChangePasswordRequest req)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy tài khoản" });

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });

        if (req.NewPassword == req.CurrentPassword)
            return BadRequest(new { message = "Mật khẩu mới phải khác mật khẩu hiện tại" });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.TokenVersion++; // làm mọi token cũ mất hiệu lực
        await _db.SaveChangesAsync();

        // Trả token mới để học viên không bị đá ra khỏi phiên hiện tại
        return Ok(new { message = "Đổi mật khẩu thành công", token = _tokens.CreateToken(user) });
    }
}
