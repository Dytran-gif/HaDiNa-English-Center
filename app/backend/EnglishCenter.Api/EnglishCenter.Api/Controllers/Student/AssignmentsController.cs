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

// Bài tập + nộp bài (trang Present Lessons của Dashboard).
// Học viên chỉ được tải/nộp bài của GV đang dạy mình (kiểm tra Enrollment -> Class.TeacherId).
// Đọc bảng Assignments qua view (AssignmentFile); ghi bằng SQL thô vì bảng không thuộc model EF.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public AssignmentsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private async Task<int?> CurrentStudentId()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return null;
        return await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();
    }

    // GET api/student/assignments?courseId= - bài tập GV giao cho khóa + bài nộp của chính mình
    [HttpGet]
    public async Task<IActionResult> GetList(int courseId)
    {
        var studentId = await CurrentStudentId();
        if (studentId == null) return Unauthorized(new { message = "Token không hợp lệ" });

        // Lọc theo CourseId để bài tập/bài nộp của khóa này không lẫn sang khóa khác
        var assignments = await _db.AssignmentFiles
            .Where(f => f.FileType == "Teacher" && f.CourseId == courseId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        var mySubs = await _db.AssignmentFiles
            .Where(f => f.FileType == "Student" && f.StudentId == studentId && f.CourseId == courseId)
            .ToListAsync();

        var items = assignments.Select(a => new StudentAssignmentDto
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            FileName = a.FileName,
            HasFile = !string.IsNullOrEmpty(a.FilePath),
            CreatedAt = a.CreatedAt,
            MySubmission = mySubs
                .Where(s => s.Title == a.Title)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new StudentSubmissionInfoDto
                {
                    Id = s.Id,
                    FileName = s.FileName,
                    SubmittedAt = s.CreatedAt
                })
                .FirstOrDefault()
        }).ToList();

        return Ok(items);
    }

    // GET api/student/assignments/{id}/download - tải file GV giao (phải học lớp của GV này)
    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var studentId = await CurrentStudentId();
        if (studentId == null) return Unauthorized(new { message = "Token không hợp lệ" });

        var a = await _db.AssignmentFiles
            .FirstOrDefaultAsync(x => x.Id == id && x.FileType == "Teacher");
        if (a == null || string.IsNullOrEmpty(a.FilePath))
            return NotFound(new { message = "Không tìm thấy file bài tập" });

        var enrolled = await _db.Enrollments.AsNoTracking()
            .AnyAsync(e => e.StudentId == studentId && e.Class.CourseId == a.CourseId);
        if (!enrolled)
            return StatusCode(403, new { message = "Bạn không thuộc khóa học này" });

        var full = AssignmentFileStorage.Resolve(_env, a.FilePath);
        if (full == null || !System.IO.File.Exists(full))
            return NotFound(new { message = "File không còn tồn tại" });

        return PhysicalFile(full, AssignmentFileStorage.ContentType(a.FileName), a.FileName);
    }

    // POST api/student/assignments/{id}/submit - nộp bài (multipart field "file": pdf/doc/docx)
    [HttpPost("{id}/submit")]
    [RequestSizeLimit(AssignmentFileStorage.MaxBytes)]
    public async Task<IActionResult> Submit(int id, IFormFile file)
    {
        var studentId = await CurrentStudentId();
        if (studentId == null) return Unauthorized(new { message = "Token không hợp lệ" });

        var a = await _db.AssignmentFiles
            .FirstOrDefaultAsync(x => x.Id == id && x.FileType == "Teacher");
        if (a == null)
            return NotFound(new { message = "Không tìm thấy bài tập" });

        var enrolled = await _db.Enrollments.AsNoTracking()
            .AnyAsync(e => e.StudentId == studentId && e.Class.CourseId == a.CourseId);
        if (!enrolled)
            return StatusCode(403, new { message = "Bạn không thuộc khóa học này" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Chưa chọn file" });
        if (!AssignmentFileStorage.IsAllowed(file.FileName))
            return BadRequest(new { message = "Chỉ hỗ trợ file PDF, DOC, DOCX" });
        if (file.Length > AssignmentFileStorage.MaxBytes)
            return BadRequest(new { message = "File tối đa 15 MB" });

        var (fileName, filePath) = await AssignmentFileStorage.SaveAsync(_env, file, "StudentSubmissions");

        await _db.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO Assignments (TeacherId, StudentId, CourseId, Title, Description, FileName, FilePath, FileType, CreatedAt) VALUES ({a.TeacherId}, {studentId}, {a.CourseId}, {a.Title}, {null}, {fileName}, {filePath}, {"Student"}, {AppTime.Now})");

        return StatusCode(201, new { message = "Nộp bài thành công" });
    }

    // GET api/student/assignments/{id}/my-submission/download - tải bài nộp mới nhất của mình
    [HttpGet("{id}/my-submission/download")]
    public async Task<IActionResult> DownloadMySubmission(int id)
    {
        var studentId = await CurrentStudentId();
        if (studentId == null) return Unauthorized(new { message = "Token không hợp lệ" });

        var a = await _db.AssignmentFiles
            .FirstOrDefaultAsync(x => x.Id == id && x.FileType == "Teacher");
        if (a == null)
            return NotFound(new { message = "Không tìm thấy bài tập" });

        var sub = await _db.AssignmentFiles
            .Where(s => s.FileType == "Student" && s.StudentId == studentId
                && s.CourseId == a.CourseId && s.Title == a.Title)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (sub == null || string.IsNullOrEmpty(sub.FilePath))
            return NotFound(new { message = "Bạn chưa nộp bài cho bài tập này" });

        var full = AssignmentFileStorage.Resolve(_env, sub.FilePath);
        if (full == null || !System.IO.File.Exists(full))
            return NotFound(new { message = "File không còn tồn tại" });

        return PhysicalFile(full, AssignmentFileStorage.ContentType(sub.FileName), sub.FileName);
    }
}
