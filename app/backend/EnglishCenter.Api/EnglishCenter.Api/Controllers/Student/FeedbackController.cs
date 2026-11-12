using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Nhận xét giáo viên viết cho học viên (trang Feedback).
// Học viên chỉ XEM nhận xét của chính mình, không được gửi/sửa/xóa.
// StudentId lấy từ token; classId phải là lớp học viên đang học -> không tin id từ client.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/feedback")]
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeedbackController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/student/feedback/classes - các lớp đang học để chọn xem nhận xét
    [HttpGet("classes")]
    public async Task<IActionResult> GetClasses()
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
            .Where(e => e.StudentId == studentId && e.Status == "Active")
            .OrderBy(e => e.Class.StartDate)
            .Select(e => new
            {
                ClassId = e.ClassId,
                ClassName = e.Class.Name,
                CourseId = e.Class.CourseId,
                CourseName = e.Class.Course.Name,
                Description = e.Class.Course.Description,
                BandFrom = e.Class.Course.BandFrom,
                BandTo = e.Class.Course.BandTo,
                TotalSessions = e.Class.Course.TotalSessions,
                SessionsPerWeek = e.Class.Course.SessionsPerWeek,
                Tuition = e.Class.Course.Tuition,
                TeacherId = e.Class.TeacherId,
                TeacherName = e.Class.Teacher.FullName
            })
            .ToListAsync();

        var items = rows.Select(e => new StudentFeedbackClassDto
        {
            ClassId = e.ClassId,
            ClassName = e.ClassName,
            CourseId = e.CourseId.ToString(),
            CourseName = e.CourseName,
            Description = e.Description ?? "",
            BandFrom = e.BandFrom.ToString("0.#"),
            BandTo = e.BandTo.ToString("0.#"),
            TotalSessions = e.TotalSessions,
            SessionsPerWeek = e.SessionsPerWeek,
            Tuition = e.Tuition,
            TeacherId = e.TeacherId,
            TeacherName = e.TeacherName
        }).ToList();

        return Ok(items);
    }

    // GET api/student/feedback?classId= - nhận xét giáo viên viết cho CHÍNH học viên đang đăng nhập,
    // trong lớp classId. 403 nếu học viên không có ghi danh lớp này.
    [HttpGet]
    public async Task<IActionResult> GetList(int classId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var enrolled = await _db.Enrollments.AsNoTracking()
            .AnyAsync(e => e.StudentId == studentId && e.ClassId == classId);
        if (!enrolled)
            return StatusCode(403, new { message = "Bạn không thuộc lớp này" });

        // Chỉ lấy nhận xét của chính học viên (StudentId = bản thân), không bao giờ trả nhận xét của người khác.
        var rows = await _db.StudentFeedbacks.AsNoTracking()
            .Where(f => f.StudentId == studentId && f.ClassId == classId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new { f.Id, f.Content, f.CreatedAt, TeacherName = f.Teacher.FullName })
            .ToListAsync();

        var items = rows.Select(f => new StudentFeedbackItemDto
        {
            Id = f.Id,
            Content = f.Content,
            CreatedAt = f.CreatedAt,
            TeacherName = f.TeacherName
        }).ToList();

        return Ok(items);
    }
}
