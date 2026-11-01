using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.StudentPortal;

// Lớp cha cho mọi API của học viên (route api/student/...).
// Trước mỗi action: lấy hồ sơ Student từ tài khoản đang đăng nhập, gán vào StudentId.
// Học viên chỉ được xem và thao tác trên dữ liệu của mình -> luôn lọc theo StudentId.
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
    protected string StudentName { get; private set; } = "";

    [NonAction]
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            context.Result = Unauthorized(new { message = "Token không hợp lệ" });
            return;
        }

        var student = await Db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => new { s.Id, s.FullName })
            .FirstOrDefaultAsync();

        if (student == null)
        {
            context.Result = StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });
            return;
        }

        UserId = userId;
        StudentId = student.Id;
        StudentName = student.FullName;
        await next();
    }

    protected IQueryable<Enrollment> MyEnrollments =>
        Db.Enrollments.Where(e => e.StudentId == StudentId && e.Status == "Active");

    protected Task<bool> IsEnrolledAsync(int classId) =>
        MyEnrollments.AnyAsync(e => e.ClassId == classId);

    protected Task<ClassSession?> MySessionAsync(int sessionId) =>
        Db.ClassSessions.Include(s => s.Class)
            .FirstOrDefaultAsync(s => s.Id == sessionId && MyEnrollments.Any(e => e.ClassId == s.ClassId));

    protected ObjectResult Error(int statusCode, string message) =>
        StatusCode(statusCode, new { message });
}
