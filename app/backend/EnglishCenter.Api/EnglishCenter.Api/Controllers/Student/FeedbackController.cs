using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Phản hồi của học viên về giáo viên/lớp (trang Feedback).
// Chỉ lớp học viên đang học (Enrollment); StudentId/TeacherId luôn lấy từ token + quan hệ DB,
// không tin id gửi từ client.
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

    // GET api/student/feedback/classes - các lớp đang học để chọn gửi phản hồi
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

    // GET api/student/feedback?classId= - phản hồi của lớp (chỉ lớp học viên có ghi danh)
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

        var rows = await _db.StudentFeedbacks.AsNoTracking()
            .Where(f => f.ClassId == classId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new { f.Id, f.Content, f.CreatedAt, StudentName = f.Student.FullName })
            .ToListAsync();

        var items = rows.Select(f => new StudentFeedbackItemDto
        {
            Id = f.Id,
            Content = f.Content,
            CreatedAt = f.CreatedAt,
            StudentName = f.StudentName
        }).ToList();

        return Ok(items);
    }

    // POST api/student/feedback - gửi phản hồi { classId, content }
    [HttpPost]
    public async Task<IActionResult> Create(FeedbackCreateRequest req)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var student = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => new { s.Id, s.FullName })
            .FirstOrDefaultAsync();

        if (student == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var content = (req.Content ?? "").Trim();
        if (content.Length == 0)
            return BadRequest(new { message = "Nội dung phản hồi không được để trống" });
        if (content.Length > 1000)
            return BadRequest(new { message = "Nội dung phản hồi tối đa 1000 ký tự" });

        // Lớp phải tồn tại và học viên đang học (Active)
        var cls = await _db.Classes.AsNoTracking()
            .Where(c => c.Id == req.ClassId)
            .Select(c => new { c.Id, c.TeacherId })
            .FirstOrDefaultAsync();
        if (cls == null)
            return NotFound(new { message = "Không tìm thấy lớp học" });

        var enrolled = await _db.Enrollments.AsNoTracking()
            .AnyAsync(e => e.StudentId == student.Id && e.ClassId == req.ClassId && e.Status == "Active");
        if (!enrolled)
            return StatusCode(403, new { message = "Bạn không thuộc lớp này" });

        var feedback = new StudentFeedback
        {
            StudentId = student.Id,
            ClassId = cls.Id,
            TeacherId = cls.TeacherId, // giáo viên lấy từ lớp, không tin id từ client
            Content = content,
            CreatedAt = AppTime.Now
        };
        _db.StudentFeedbacks.Add(feedback);
        await _db.SaveChangesAsync();

        return StatusCode(201, new { feedback.Id, message = "Gửi phản hồi thành công" });
    }
}
