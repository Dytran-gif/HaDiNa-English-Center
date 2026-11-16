using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Bài tập dạng file, dùng chung bảng Assignments với module Student:
// - Giáo viên giao: FileType = "Teacher", StudentId = NULL, CourseId = khóa (học viên mọi lớp của khóa đều thấy).
// - Học viên nộp:   FileType = "Student", AssignmentId = Id bài gốc, TeacherId = GV giao bài.
// File lưu ở wwwroot/uploads/AssignmentUploads (AssignmentFileStorage), chỉ nhận PDF/DOC/DOCX ≤ 15 MB.
// Lưu ý: AssignmentFileCleanupService (module Student) xóa file quá 7 ngày, record vẫn giữ.
[Route("api/teacher")]
public class TeacherAssignmentsController : TeacherControllerBase
{
    private readonly IWebHostEnvironment _env;

    public TeacherAssignmentsController(AppDbContext db, IWebHostEnvironment env) : base(db)
    {
        _env = env;
    }

    private IQueryable<AssignmentFile> MyAssignments =>
        Db.AssignmentFiles.Where(a => a.FileType == "Teacher" && a.TeacherId == TeacherId);

    // GET api/teacher/assignments/courses - khóa học mình đang dạy (để chọn khi giao bài)
    [HttpGet("assignments/courses")]
    public async Task<IActionResult> Courses()
    {
        var items = await Db.Courses.AsNoTracking()
            .Where(c => MyCourseIds.Contains(c.Id))
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();
        return Ok(items);
    }

    // GET api/teacher/assignments?courseId=
    [HttpGet("assignments")]
    public async Task<IActionResult> List(int? courseId)
    {
        var q = MyAssignments.AsNoTracking();
        if (courseId != null) q = q.Where(a => a.CourseId == courseId);

        var rows = await q
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id, a.Title, a.Description, a.FileName, HasFile = a.FilePath != "", a.CourseId,
                CourseName = Db.Courses.Where(c => c.Id == a.CourseId).Select(c => c.Name).FirstOrDefault(),
                a.CreatedAt,
                SubmittedCount = Db.AssignmentFiles
                    .Where(s => s.FileType == "Student" && s.AssignmentId == a.Id)
                    .Select(s => s.StudentId).Distinct().Count()
            })
            .ToListAsync();

        // Sĩ số = học viên đang học ở các lớp mình dạy thuộc khóa đó
        var courseIds = rows.Where(r => r.CourseId != null).Select(r => r.CourseId!.Value).Distinct().ToList();
        var sizes = await MyEnrollments
            .Where(e => courseIds.Contains(e.Class.CourseId))
            .GroupBy(e => e.Class.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Select(e => e.StudentId).Distinct().Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        return Ok(rows.Select(r => new
        {
            r.Id, r.Title, r.Description, r.FileName, r.HasFile, r.CourseId, r.CourseName, r.CreatedAt,
            r.SubmittedCount,
            StudentCount = r.CourseId != null ? sizes.GetValueOrDefault(r.CourseId.Value) : 0
        }));
    }

    // POST api/teacher/assignments  (multipart: title, description?, courseId, file? pdf/doc/docx)
    [HttpPost("assignments")]
    [RequestSizeLimit(AssignmentFileStorage.MaxBytes)]
    public async Task<IActionResult> Create([FromForm] string title, [FromForm] string? description,
        [FromForm] int courseId, IFormFile? file)
    {
        title = (title ?? "").Trim();
        description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (title.Length == 0) return Error(400, "Nhập tiêu đề bài tập");
        if (title.Length > 250) return Error(400, "Tiêu đề tối đa 250 ký tự");
        if (description?.Length > 2000) return Error(400, "Mô tả tối đa 2000 ký tự");
        if (!await MyCourseIds.ContainsAsync(courseId)) return Error(403, "Bạn không dạy lớp nào thuộc khóa này");

        string fileName = "", filePath = "";
        if (file != null && file.Length > 0)
        {
            if (!AssignmentFileStorage.IsAllowed(file.FileName)) return Error(400, "Chỉ hỗ trợ file PDF, DOC, DOCX");
            if (file.Length > AssignmentFileStorage.MaxBytes) return Error(400, "File tối đa 15 MB");
            (fileName, filePath) = await AssignmentFileStorage.SaveAsync(_env, file, "TeacherAssignments");
        }
        else if (description == null)
            return Error(400, "Cần đính kèm file đề bài hoặc nhập mô tả");

        var a = new AssignmentFile
        {
            TeacherId = TeacherId,
            CourseId = courseId,
            Title = title,
            Description = description,
            FileName = fileName,
            FilePath = filePath,
            FileType = "Teacher",
            CreatedAt = AppTime.Now
        };
        Db.AssignmentFiles.Add(a);
        await Db.SaveChangesAsync();
        return StatusCode(201, new { a.Id, message = "Đã giao bài tập" });
    }

    // DELETE api/teacher/assignments/5 - chỉ xóa được khi chưa có học viên nộp
    [HttpDelete("assignments/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await MyAssignments.FirstOrDefaultAsync(x => x.Id == id);
        if (a == null) return Error(404, "Không tìm thấy bài tập");
        if (await Db.AssignmentFiles.AnyAsync(s => s.FileType == "Student" && s.AssignmentId == id))
            return Error(409, "Đã có học viên nộp bài, không thể xóa");

        AssignmentFileStorage.Delete(_env, a.FilePath);
        Db.AssignmentFiles.Remove(a);
        await Db.SaveChangesAsync();
        return Ok(new { message = "Đã xóa bài tập" });
    }

    // GET api/teacher/assignments/5/download - file đề bài
    [HttpGet("assignments/{id:int}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var a = await MyAssignments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (a == null) return Error(404, "Không tìm thấy bài tập");
        return SendFile(a.FilePath, a.FileName);
    }

    // GET api/teacher/assignments/5/submissions - tình hình nộp bài của từng học viên
    [HttpGet("assignments/{id:int}/submissions")]
    public async Task<IActionResult> Submissions(int id)
    {
        var a = await MyAssignments.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id, x.Title, x.Description, x.FileName, HasFile = x.FilePath != "", x.CourseId, x.CreatedAt,
                CourseName = Db.Courses.Where(c => c.Id == x.CourseId).Select(c => c.Name).FirstOrDefault()
            })
            .FirstOrDefaultAsync();
        if (a == null) return Error(404, "Không tìm thấy bài tập");

        var students = await MyEnrollments
            .Where(e => e.Class.CourseId == a.CourseId)
            .Select(e => new { e.StudentId, e.Student.Code, e.Student.FullName, ClassName = e.Class.Name })
            .ToListAsync();

        var subs = await Db.AssignmentFiles.AsNoTracking()
            .Where(s => s.FileType == "Student" && s.AssignmentId == id)
            .Select(s => new { s.Id, s.StudentId, s.FileName, HasFile = s.FilePath != "", s.CreatedAt })
            .ToListAsync();

        // Học viên có nộp nhưng không còn trong lớp (đã nghỉ...) vẫn hiện để không mất bài
        var extraIds = subs.Select(s => s.StudentId!.Value).Distinct()
            .Except(students.Select(s => s.StudentId)).ToList();
        var extra = await Db.Students.AsNoTracking()
            .Where(s => extraIds.Contains(s.Id))
            .Select(s => new { StudentId = s.Id, s.Code, s.FullName, ClassName = "(không còn trong lớp)" })
            .ToListAsync();

        var items = students.Concat(extra)
            .GroupBy(s => s.StudentId).Select(g => g.First())
            .OrderBy(s => s.FullName)
            .Select(s =>
            {
                var mine = subs.Where(x => x.StudentId == s.StudentId).OrderByDescending(x => x.CreatedAt).ToList();
                var last = mine.FirstOrDefault();
                return new
                {
                    s.StudentId, s.Code, s.FullName, s.ClassName,
                    AttemptCount = mine.Count,
                    Submission = last == null ? null : new { last.Id, last.FileName, last.HasFile, SubmittedAt = last.CreatedAt }
                };
            })
            .ToList();

        return Ok(new { Assignment = a, Items = items });
    }

    // GET api/teacher/submissions/9/download - file bài nộp của học viên
    [HttpGet("submissions/{id:int}/download")]
    public async Task<IActionResult> DownloadSubmission(int id)
    {
        var s = await Db.AssignmentFiles.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FileType == "Student" && x.TeacherId == TeacherId);
        if (s == null) return Error(404, "Không tìm thấy bài nộp");
        return SendFile(s.FilePath, s.FileName);
    }

    private IActionResult SendFile(string filePath, string fileName)
    {
        if (string.IsNullOrEmpty(filePath)) return Error(404, "Không có file đính kèm (file quá 7 ngày đã được dọn)");
        var full = AssignmentFileStorage.Resolve(_env, filePath);
        if (full == null || !System.IO.File.Exists(full)) return Error(404, "File không còn tồn tại");
        return PhysicalFile(full, AssignmentFileStorage.ContentType(fileName), fileName);
    }
}
