using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.TeacherPortal;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Học viên trong các lớp mình dạy + nhận xét học viên (bảng StudentFeedbacks, Student xem ở trang Feedback).
[Route("api/teacher")]
public class TeacherStudentsController : TeacherControllerBase
{
    public TeacherStudentsController(AppDbContext db) : base(db) { }

    // GET api/teacher/students?classId=&q=
    [HttpGet("students")]
    public async Task<IActionResult> List(int? classId, string? q)
    {
        var enr = Db.Enrollments.AsNoTracking().Where(e => e.Class.TeacherId == TeacherId);
        if (classId != null) enr = enr.Where(e => e.ClassId == classId);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var k = q.Trim();
            enr = enr.Where(e => e.Student.FullName.Contains(k) || e.Student.Code.Contains(k)
                || e.Student.User.Email.Contains(k) || e.Student.Phone.Contains(k));
        }

        var rows = await enr
            .Select(e => new
            {
                e.StudentId, e.Student.Code, e.Student.FullName, e.Student.Phone, e.Student.User.Email,
                StudentStatus = e.Student.Status, e.ClassId, ClassName = e.Class.Name, EnrollmentStatus = e.Status
            })
            .ToListAsync();

        var items = rows
            .GroupBy(r => r.StudentId)
            .Select(g =>
            {
                var f = g.First();
                return new
                {
                    Id = f.StudentId, f.Code, f.FullName, f.Phone, f.Email, Status = f.StudentStatus,
                    Classes = g.Select(x => new { Id = x.ClassId, Name = x.ClassName, x.EnrollmentStatus }).ToList()
                };
            })
            .OrderBy(s => s.FullName)
            .ToList();
        return Ok(items);
    }

    // GET api/teacher/students/5 - hồ sơ học viên, lớp đang học với mình, bài nộp, nhận xét
    [HttpGet("students/{id:int}")]
    public async Task<IActionResult> Detail(int id)
    {
        if (!await Db.Enrollments.AnyAsync(e => e.StudentId == id && e.Class.TeacherId == TeacherId))
            return Error(404, "Không tìm thấy học viên trong các lớp bạn dạy");

        var s = await Db.Students.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id, x.Code, x.FullName, x.Phone, x.User.Email, x.DateOfBirth, x.Address,
                x.ParentName, x.ParentPhone, x.Status, x.User.AvatarUrl
            })
            .FirstAsync();

        var classes = await Db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == id && e.Class.TeacherId == TeacherId)
            .Select(e => new { Id = e.ClassId, e.Class.Name, CourseName = e.Class.Course.Name, e.Status, e.Class.StartDate, e.Class.EndDate })
            .ToListAsync();

        var submissions = await (
            from sub in Db.AssignmentFiles
            where sub.FileType == "Student" && sub.StudentId == id && sub.TeacherId == TeacherId
            from a in Db.AssignmentFiles.Where(x => x.Id == sub.AssignmentId).DefaultIfEmpty()
            orderby sub.CreatedAt descending
            select new
            {
                sub.Id, sub.AssignmentId, AssignmentTitle = a != null ? a.Title : sub.Title,
                sub.FileName, HasFile = sub.FilePath != "", SubmittedAt = sub.CreatedAt
            })
            .ToListAsync();

        var feedbacks = await FeedbackQuery(null, id).ToListAsync();

        // Chuyên cần theo từng lớp mình dạy
        var attendance = await Db.Attendances.AsNoTracking()
            .Where(a => a.StudentId == id && a.Class.TeacherId == TeacherId)
            .GroupBy(a => a.ClassId)
            .Select(g => new
            {
                ClassId = g.Key,
                Present = g.Count(a => a.Status == "Present"),
                Late = g.Count(a => a.Status == "Late"),
                Absent = g.Count(a => a.Status == "Absent"),
                Excused = g.Count(a => a.Status == "Excused")
            })
            .ToListAsync();
        var recentAbsences = await Db.Attendances.AsNoTracking()
            .Where(a => a.StudentId == id && a.Class.TeacherId == TeacherId && a.Status != "Present")
            .OrderByDescending(a => a.Date)
            .Select(a => new { a.ClassId, ClassName = a.Class.Name, a.Date, a.Status, a.Note })
            .Take(10)
            .ToListAsync();

        return Ok(new
        {
            Student = s, Classes = classes, Submissions = submissions, Feedbacks = feedbacks,
            Attendance = attendance, RecentAbsences = recentAbsences
        });
    }

    // GET api/teacher/feedbacks?classId=&studentId=
    [HttpGet("feedbacks")]
    public async Task<IActionResult> Feedbacks(int? classId, int? studentId)
    {
        return Ok(await FeedbackQuery(classId, studentId).ToListAsync());
    }

    // POST api/teacher/feedbacks { studentId, classId, content }
    [HttpPost("feedbacks")]
    public async Task<IActionResult> AddFeedback(FeedbackCreateRequest req)
    {
        var content = req.Content.Trim();
        if (content.Length == 0) return Error(400, "Nhập nội dung nhận xét");
        if (!await MyClasses.AnyAsync(c => c.Id == req.ClassId))
            return Error(403, "Bạn không phụ trách lớp này");
        if (!await Db.Enrollments.AnyAsync(e => e.ClassId == req.ClassId && e.StudentId == req.StudentId))
            return Error(400, "Học viên không thuộc lớp này");

        var f = new StudentFeedback
        {
            StudentId = req.StudentId,
            ClassId = req.ClassId,
            TeacherId = TeacherId,
            Content = content,
            CreatedAt = AppTime.Now
        };
        Db.StudentFeedbacks.Add(f);
        await Db.SaveChangesAsync();
        return StatusCode(201, new { f.Id, message = "Đã gửi nhận xét" });
    }

    // DELETE api/teacher/feedbacks/5 - chỉ xóa nhận xét của chính mình
    [HttpDelete("feedbacks/{id:int}")]
    public async Task<IActionResult> DeleteFeedback(int id)
    {
        var f = await Db.StudentFeedbacks.FirstOrDefaultAsync(x => x.Id == id && x.TeacherId == TeacherId);
        if (f == null) return Error(404, "Không tìm thấy nhận xét");
        Db.StudentFeedbacks.Remove(f);
        await Db.SaveChangesAsync();
        return Ok(new { message = "Đã xóa nhận xét" });
    }

    // Lọc trước khi Select (EF không dịch được điều kiện trên record đã chiếu)
    private IQueryable<FeedbackItem> FeedbackQuery(int? classId, int? studentId) =>
        Db.StudentFeedbacks.AsNoTracking()
            .Where(f => f.TeacherId == TeacherId
                && (classId == null || f.ClassId == classId)
                && (studentId == null || f.StudentId == studentId))
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FeedbackItem(f.Id, f.StudentId, f.Student.Code, f.Student.FullName,
                f.ClassId, f.Class.Name, f.Content, f.CreatedAt));

    public record FeedbackItem(int Id, int StudentId, string StudentCode, string StudentName,
        int ClassId, string ClassName, string Content, DateTime CreatedAt);
}
