using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Điểm danh của học viên trong một khóa (tab Điểm danh của popup Present Lessons).
// Chỉ trả điểm danh của CHÍNH học viên đang đăng nhập, trong các lớp thuộc khóa đó.
// Phân trang 10 buổi/trang, buổi mới nhất hiện trước.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/attendance")]
public class AttendanceController : ControllerBase
{
    private const int PageSize = 10;

    private readonly AppDbContext _db;

    public AttendanceController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/student/attendance?courseId=2&page=1
    [HttpGet]
    public async Task<IActionResult> GetPage(int courseId, int page = 1)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        if (!await _db.Courses.AsNoTracking().AnyAsync(c => c.Id == courseId))
            return NotFound(new { message = "Không tìm thấy khóa học" });

        if (page < 1) page = 1;

        // Chỉ chọn Id của lớp để không load entity Class/Student (tránh cột thiếu trong DB dev)
        var classIds = _db.Classes.AsNoTracking()
            .Where(c => c.CourseId == courseId)
            .Select(c => c.Id);

        var query = _db.Attendances.AsNoTracking()
            .Where(a => a.StudentId == studentId && classIds.Contains(a.ClassId));

        var total = await query.CountAsync();

        var counts = await query
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var rows = await query
            .OrderByDescending(a => a.Date).ThenByDescending(a => a.Id)
            .Skip((page - 1) * PageSize).Take(PageSize)
            .Select(a => new { a.Id, a.Date, a.Status, a.Note })
            .ToListAsync();

        var offset = (page - 1) * PageSize;
        var result = new StudentAttendancePageDto
        {
            TotalItems = total,
            Page = page,
            PageSize = PageSize,
            Summary = new StudentAttendanceSummaryDto
            {
                Present = counts.FirstOrDefault(c => c.Status == "Present")?.Count ?? 0,
                Late = counts.FirstOrDefault(c => c.Status == "Late")?.Count ?? 0,
                Absent = counts.FirstOrDefault(c => c.Status == "Absent")?.Count ?? 0,
                Excused = counts.FirstOrDefault(c => c.Status == "Excused")?.Count ?? 0
            },
            Items = rows.Select((a, i) => new StudentAttendanceItemDto
            {
                Id = a.Id,
                SessionNumber = total - offset - i,
                Date = a.Date,
                Status = a.Status,
                Note = a.Note
            }).ToList()
        };

        return Ok(result);
    }
}