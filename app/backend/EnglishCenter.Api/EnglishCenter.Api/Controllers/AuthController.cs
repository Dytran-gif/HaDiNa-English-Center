using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos;
using EnglishCenter.Api.Dtos.Common;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EnglishCenter.Api.Entities;
using Microsoft.Data.SqlClient;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public AuthController(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var email = req.Email.Trim();
        var user = await _db.Users.Include(u => u.Student).FirstOrDefaultAsync(u => u.Email == email);

        // Cùng một thông báo cho "sai email" và "sai mật khẩu" để không lộ email nào tồn tại
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

        if (user.IsLocked || user.Student?.DeletedAt != null)
            return StatusCode(403, new { message = "Tài khoản đã bị khóa" });

        return Ok(new LoginResponse
        {
            Token = _tokens.CreateToken(user),
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterStudentInput input, CancellationToken ct)
    {
        var email = input.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            return Conflict(new { message = "Email đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." });
        var hash = BCrypt.Net.BCrypt.HashPassword(input.Password);
        for (var attempt = 0; attempt < 3; attempt++)
        {
            var now = AppTime.Now;
            var student = new Student
            {
                Code = await StudentCodeGenerator.NextAsync(_db, ct), FullName = input.FullName.Trim(),
                Phone = input.Phone.Trim(), Status = "Studying", CreatedAt = now,
                DateOfBirth = input.DateOfBirth,
                ParentName = string.IsNullOrWhiteSpace(input.ParentName) ? null : input.ParentName.Trim(),
                ParentPhone = string.IsNullOrWhiteSpace(input.ParentPhone) ? null : input.ParentPhone.Trim(),
                User = new User { Email = email, PasswordHash = hash, Role = "student", CreatedAt = now }
            };
            _db.Students.Add(student);
            try
            {
                // EF inserts the account and profile atomically in one SaveChanges transaction.
                await _db.SaveChangesAsync(ct);
                // Trả kèm token để FE đăng nhập luôn và chuyển sang bước chọn khóa / lớp
                return StatusCode(201, new
                {
                    message = "Đăng ký tài khoản học viên thành công.",
                    code = student.Code,
                    login = new LoginResponse { Token = _tokens.CreateToken(student.User), UserId = student.User.Id, Email = email, Role = "student" }
                });
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2601 or 2627 })
            {
                _db.ChangeTracker.Clear();
                if (await _db.Users.AnyAsync(u => u.Email == email, ct))
                    return Conflict(new { message = "Email đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." });
                // Another registration/Admin insert may have taken this code; generate the next one.
            }
        }
        return Conflict(new { message = "Chưa tạo được mã học viên. Vui lòng thử lại." });
    }

    // Endpoint thử: ai đăng nhập rồi cũng gọi được
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
        });
    }
}
