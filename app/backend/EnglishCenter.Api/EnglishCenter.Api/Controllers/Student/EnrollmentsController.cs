using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Ghi danh của học viên: danh sách khóa đã đăng ký (trang Courses - khối bên dưới) và hủy đăng ký.
// Viết độc lập, truy vấn thẳng AppDbContext, khớp type trong FE GeneralTypes.ts.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/enrollments")]
public class EnrollmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public EnrollmentsController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/student/enrollments - các ghi danh của học viên đang đăng nhập (mới nhất trước)
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var rows = await _db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.Id)
            .Select(e => new
            {
                e.Id,
                e.Status,
                CourseId = e.Class.CourseId,
                CourseName = e.Class.Course.Name,
                Description = e.Class.Course.Description,
                BandFrom = e.Class.Course.BandFrom,
                BandTo = e.Class.Course.BandTo,
                TotalSessions = e.Class.Course.TotalSessions,
                SessionsPerWeek = e.Class.Course.SessionsPerWeek,
                Tuition = e.Class.Course.Tuition,
                DiscountPercent = e.Class.Course.DiscountPercent
            })
            .ToListAsync();

        var items = rows.Select(e => new StudentEnrollmentItemDto
        {
            EnrollmentId = e.Id,
            Status = e.Status,
            Course = new CourseItemDto
            {
                Id = e.CourseId.ToString(),
                Name = e.CourseName,
                Description = e.Description ?? "",
                BandFrom = e.BandFrom.ToString("0.#"),
                BandTo = e.BandTo.ToString("0.#"),
                TotalSessions = e.TotalSessions,
                SessionsPerWeek = e.SessionsPerWeek,
                Tuition = e.Tuition,
                DiscountPercent = e.DiscountPercent,
                ImageUrl = null // bảng Courses chưa có cột ảnh; FE tự dùng ảnh mặc định
            }
        }).ToList();

        return Ok(items);
    }

    // DELETE api/student/enrollments/{enrollmentId} - hủy ghi danh của chính mình
    [HttpDelete("{enrollmentId}")]
    public async Task<IActionResult> Delete(int enrollmentId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var enrollment = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.Id == enrollmentId && e.StudentId == studentId);

        if (enrollment == null)
            return NotFound(new { message = "Không tìm thấy ghi danh" });

        _db.Enrollments.Remove(enrollment);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Ghi danh đã có phiếu thu (Payment 1-1): không cho tự xóa
            return StatusCode(409, new { message = "Ghi danh đã có phiếu thu, không thể tự hủy" });
        }

        return Ok(new { message = "Đã hủy đăng ký khóa học" });
    }
}
