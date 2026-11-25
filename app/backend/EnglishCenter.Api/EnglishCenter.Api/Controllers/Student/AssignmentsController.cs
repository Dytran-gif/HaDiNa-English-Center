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

// Bài tập + nộp bài. Bài tập theo LỚP: học viên chỉ thấy bài của lớp mình (hoặc bài giao chung của chính GV lớp đó).
// Nhận classId (mới) hoặc courseId (FE cũ) -> quy về lớp của mình trong khóa. Không thuộc lớp -> 403.
[Route("api/student/assignments")]
public class AssignmentsController : StudentControllerBase
{
    private readonly IWebHostEnvironment _env;

    public AssignmentsController(AppDbContext db, IWebHostEnvironment env) : base(db)
    {
        _env = env;
    }

    // GET api/student/assignments?classId= (hoặc ?courseId=) - bài tập của lớp + bài nộp của mình
    [HttpGet]
    public async Task<IActionResult> GetList(int? classId, int? courseId)
    {
        var my = await ResolveMyClassAsync(classId, courseId);
        if (my == null) return Error(403, "Bạn không thuộc lớp/khóa học này");

        var assignments = await AssignmentsFor(my).AsNoTracking()
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
        var ids = assignments.Select(a => a.Id).ToList();

        var mySubs = await Db.AssignmentFiles.AsNoTracking()
            .Where(f => f.FileType == "Student" && f.StudentId == StudentId && f.AssignmentId != null && ids.Contains(f.AssignmentId.Value))
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
                .Where(s => s.AssignmentId == a.Id)
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

    // GET api/student/assignments/{id}/download - tải file GV giao (phải học lớp nhận bài)
    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(int id)
    {
        var a = await Db.AssignmentFiles.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FileType == "Teacher");
        if (a == null || string.IsNullOrEmpty(a.FilePath))
            return Error(404, "Không tìm thấy file bài tập");

        if (await MyClassForAssignmentAsync(a) == null)
            return Error(403, "Bạn không thuộc lớp được giao bài này");

        var full = AssignmentFileStorage.Resolve(_env, a.FilePath);
        if (full == null || !System.IO.File.Exists(full))
            return Error(404, "File không còn tồn tại");

        return PhysicalFile(full, AssignmentFileStorage.ContentType(a.FileName), a.FileName);
    }

    // POST api/student/assignments/{id}/submit - nộp bài (multipart field "file": pdf/doc/docx)
    [HttpPost("{id}/submit")]
    [RequestSizeLimit(AssignmentFileStorage.MaxBytes)]
    public async Task<IActionResult> Submit(int id, IFormFile file)
    {
        var a = await Db.AssignmentFiles.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.FileType == "Teacher");
        if (a == null)
            return Error(404, "Không tìm thấy bài tập");

        var my = await MyClassForAssignmentAsync(a);
        if (my == null)
            return Error(403, "Bạn không thuộc lớp được giao bài này");

        if (file == null || file.Length == 0)
            return Error(400, "Chưa chọn file");
        if (!AssignmentFileStorage.IsAllowed(file.FileName))
            return Error(400, "Chỉ hỗ trợ file PDF, DOC, DOCX");
        if (file.Length > AssignmentFileStorage.MaxBytes)
            return Error(400, "File tối đa 15 MB");

        var (fileName, filePath) = await AssignmentFileStorage.SaveAsync(_env, file, "StudentSubmissions");

        await Db.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO Assignments (TeacherId, StudentId, CourseId, ClassId, AssignmentId, Title, Description, FileName, FilePath, FileType, CreatedAt) VALUES ({a.TeacherId}, {StudentId}, {a.CourseId}, {my.ClassId}, {a.Id}, {a.Title}, {null}, {fileName}, {filePath}, {"Student"}, {AppTime.Now})");

        return StatusCode(201, new { message = "Nộp bài thành công" });
    }

    // GET api/student/assignments/{id}/my-submission/download - tải bài nộp mới nhất của mình
    [HttpGet("{id}/my-submission/download")]
    public async Task<IActionResult> DownloadMySubmission(int id)
    {
        var sub = await Db.AssignmentFiles.AsNoTracking()
            .Where(s => s.FileType == "Student" && s.StudentId == StudentId && s.AssignmentId == id)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (sub == null || string.IsNullOrEmpty(sub.FilePath))
            return Error(404, "Bạn chưa nộp bài cho bài tập này");

        var full = AssignmentFileStorage.Resolve(_env, sub.FilePath);
        if (full == null || !System.IO.File.Exists(full))
            return Error(404, "File không còn tồn tại");

        return PhysicalFile(full, AssignmentFileStorage.ContentType(sub.FileName), sub.FileName);
    }
}
