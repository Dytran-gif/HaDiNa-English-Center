using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

// namespace ...StudentPortal (không phải ...Student) vì trùng tên entity Student
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Lớp cha cho API học viên (giống TeacherControllerBase): lấy hồ sơ Student từ JWT trước mỗi action,
// mọi truy vấn lọc theo StudentId của chính mình, không tin id từ client.
[ApiController]
[Authorize(Roles = "student")]
public abstract class StudentControllerBase : ControllerBase, IAsyncActionFilter
{
    protected readonly AppDbContext Db;

    protected StudentControllerBase(AppDbContext db)
    {
        Db = db;
    }

    protected int UserId { get; private set; }
    protected int StudentId { get; private set; }

    [NonAction]
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            context.Result = Unauthorized(new { message = "Token không hợp lệ" });
            return;
        }

        var studentId = await Db.Students.AsNoTracking()
            .Where(s => s.UserId == userId && s.DeletedAt == null)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();
        if (studentId == null)
        {
            context.Result = StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });
            return;
        }

        UserId = userId;
        StudentId = studentId.Value;
        await next();
    }

    protected ObjectResult Error(int statusCode, string message) => StatusCode(statusCode, new { message });

    protected IQueryable<Enrollment> MyEnrollments => Db.Enrollments.Where(e => e.StudentId == StudentId);

    public record ClassRef(int ClassId, int CourseId, int TeacherId);

    // Lớp của mình: theo classId, hoặc (API cũ) theo courseId -> lớp mới nhất của khóa đó
    protected async Task<ClassRef?> ResolveMyClassAsync(int? classId, int? courseId)
    {
        var q = MyEnrollments.AsNoTracking();
        if (classId is > 0) q = q.Where(e => e.ClassId == classId);
        else if (courseId is > 0) q = q.Where(e => e.Class.CourseId == courseId);
        else return null;
        return await q.OrderByDescending(e => e.Status == "Active").ThenByDescending(e => e.Class.StartDate)
            .Select(e => new ClassRef(e.ClassId, e.Class.CourseId, e.Class.TeacherId))
            .FirstOrDefaultAsync();
    }

    // Bài tập GV giao cho lớp: đúng lớp, hoặc bài cũ / giao chung (ClassId NULL) của chính GV lớp đó trong khóa
    protected IQueryable<AssignmentFile> AssignmentsFor(ClassRef c) =>
        Db.AssignmentFiles.Where(a => a.FileType == "Teacher"
            && (a.ClassId == c.ClassId || (a.ClassId == null && a.CourseId == c.CourseId && a.TeacherId == c.TeacherId)));

    // Lớp của mình mà bài tập này thuộc về (null = không có quyền)
    protected async Task<ClassRef?> MyClassForAssignmentAsync(AssignmentFile a)
    {
        var q = MyEnrollments.AsNoTracking();
        q = a.ClassId != null
            ? q.Where(e => e.ClassId == a.ClassId)
            : q.Where(e => e.Class.CourseId == a.CourseId && e.Class.TeacherId == a.TeacherId);
        return await q.OrderByDescending(e => e.Status == "Active")
            .Select(e => new ClassRef(e.ClassId, e.Class.CourseId, e.Class.TeacherId))
            .FirstOrDefaultAsync();
    }
    // Ghi danh của mình kèm lớp, lịch tuần và tiền (dùng chung Dashboard / Khóa của tôi / Học phí / Lịch)
    public record MyEnrollment(int EnrollmentId, string Status, DateTime CreatedAt,
        int ClassId, string ClassName, DateOnly StartDate, DateOnly EndDate,
        int CourseId, string CourseName, string? Description, decimal BandFrom, decimal BandTo,
        int CourseTotalSessions, int SessionsPerWeek, decimal Tuition, decimal CourseDiscountPercent, string? ImageUrl,
        int TeacherId, string TeacherName, decimal TuitionFee, decimal DiscountPercent, decimal DiscountAmount,
        decimal ExtraDiscountAmount, string? DiscountNote, decimal FinalTuitionFee,
        List<Payment> Payments, List<(ClassCalendar.Slot Slot, string RoomName)> Slots)
    {
        public ClassRef Ref => new(ClassId, CourseId, TeacherId);
        public List<ClassCalendar.Slot> CalendarSlots => Slots.Select(s => s.Slot).ToList();
        public string ClassStatus(DateOnly today) => ClassCalendar.Status(StartDate, EndDate, today);
        public TuitionBalance Balance => PaymentService.Balance(FinalTuitionFee, Payments);
        public int TotalSessions => ClassCalendar.TotalSessions(StartDate, EndDate, CalendarSlots);
        public int DoneSessions(DateOnly today) => ClassCalendar.DoneSessions(StartDate, EndDate, CalendarSlots, today);
        public string ScheduleText => string.Join(" · ", Slots
            .GroupBy(s => (s.Slot.StartTime, s.Slot.EndTime))
            .Select(g => string.Join(", ", g.Select(x => x.Slot.DayOfWeek == 7 ? "CN" : $"T{x.Slot.DayOfWeek + 1}").Distinct())
                + $" {g.Key.StartTime:HH\\:mm}–{g.Key.EndTime:HH\\:mm}"));
    }

    protected async Task<List<MyEnrollment>> LoadMyEnrollmentsAsync(System.Linq.Expressions.Expression<Func<Enrollment, bool>>? filter = null)
    {
        var q = MyEnrollments.AsNoTracking();
        if (filter != null) q = q.Where(filter);
        var rows = await q.OrderBy(e => e.Class.StartDate).ThenBy(e => e.Id)
            .Select(e => new
            {
                e.Id, e.Status, e.CreatedAt, e.ClassId, ClassName = e.Class.Name,
                e.Class.StartDate, e.Class.EndDate,
                e.Class.CourseId, CourseName = e.Class.Course.Name, e.Class.Course.Description,
                e.Class.Course.BandFrom, e.Class.Course.BandTo, CourseTotal = e.Class.Course.TotalSessions,
                e.Class.Course.SessionsPerWeek, e.Class.Course.Tuition, CourseDiscount = e.Class.Course.DiscountPercent,
                e.Class.Course.ImageUrl, e.Class.TeacherId, TeacherName = e.Class.Teacher.FullName,
                e.TuitionFee, e.DiscountPercent, e.DiscountAmount, e.ExtraDiscountAmount, e.DiscountNote, e.FinalTuitionFee,
                Payments = e.Payments.ToList(),
                Slots = e.Class.Schedules.OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
                    .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime, RoomName = s.Room.Name }).ToList()
            })
            .ToListAsync();
        return rows.Select(r => new MyEnrollment(r.Id, r.Status, r.CreatedAt, r.ClassId, r.ClassName,
            r.StartDate, r.EndDate, r.CourseId, r.CourseName, r.Description, r.BandFrom, r.BandTo,
            r.CourseTotal, r.SessionsPerWeek, r.Tuition, r.CourseDiscount, r.ImageUrl, r.TeacherId, r.TeacherName,
            r.TuitionFee, r.DiscountPercent, r.DiscountAmount, r.ExtraDiscountAmount, r.DiscountNote, r.FinalTuitionFee,
            r.Payments, r.Slots.Select(s => (new ClassCalendar.Slot(s.DayOfWeek, s.StartTime, s.EndTime), s.RoomName)).ToList()))
            .ToList();
    }
}
