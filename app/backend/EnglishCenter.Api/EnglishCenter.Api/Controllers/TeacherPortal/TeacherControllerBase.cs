using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Lớp cha cho mọi API của giáo viên (route api/teacher/...). Chỉ dùng 14 bảng chung của nhóm.
// Trước mỗi action: lấy hồ sơ Teacher từ tài khoản đang đăng nhập, gán vào TeacherId.
// Giáo viên chỉ thao tác trên lớp mình phụ trách -> luôn lọc theo TeacherId.
[ApiController]
[Authorize(Roles = "teacher")]
public abstract class TeacherControllerBase : ControllerBase, IAsyncActionFilter
{
    protected readonly AppDbContext Db;

    protected TeacherControllerBase(AppDbContext db)
    {
        Db = db;
    }

    protected int UserId { get; private set; }
    protected int TeacherId { get; private set; }

    [NonAction]
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            context.Result = Unauthorized(new { message = "Token không hợp lệ" });
            return;
        }

        var teacherId = await Db.Teachers.AsNoTracking()
            .Where(t => t.UserId == userId)
            .Select(t => (int?)t.Id)
            .FirstOrDefaultAsync();
        if (teacherId == null)
        {
            context.Result = StatusCode(403, new { message = "Tài khoản chưa có hồ sơ giáo viên" });
            return;
        }

        UserId = userId;
        TeacherId = teacherId.Value;
        await next();
    }

    protected IQueryable<CourseClass> MyClasses => Db.Classes.Where(c => c.TeacherId == TeacherId);

    // Khóa học có ít nhất một lớp mình dạy (bài tập gắn theo khóa)
    protected IQueryable<int> MyCourseIds => MyClasses.Select(c => c.CourseId).Distinct();

    // Học viên đang học (Active) ở các lớp mình dạy
    protected IQueryable<Enrollment> MyEnrollments =>
        Db.Enrollments.Where(e => e.Class.TeacherId == TeacherId && e.Status == "Active");

    protected ObjectResult Error(int statusCode, string message) => StatusCode(statusCode, new { message });

    protected static string ClassStatus(DateOnly start, DateOnly end, DateOnly today) =>
        today < start ? "Upcoming" : today > end ? "Finished" : "Ongoing";
}
