using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Common;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.StudentPortal;

[Route("api/student/course-registrations")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class CourseRegistrationsController(AppDbContext db) : StudentControllerBase(db)
{
    [HttpGet]
    public async Task<IActionResult> List() => Ok(await CourseRegistrationQueries.Project(Db.CourseRegistrations.AsNoTracking()
        .Where(r => r.StudentId == StudentId).OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id)).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(RegisterCourseRequest request)
    {
        await using var tx = await Db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        await StudentLifecycle.LockAsync(Db, StudentId);
        if (!await Db.Students.AnyAsync(s => s.Id == StudentId && s.DeletedAt == null && s.Status != "Dropped"))
            return Error(409, "Học viên đã nghỉ hoặc đã được xóa, không thể đăng ký khóa học");
        if (!await Db.Courses.AnyAsync(c => c.Id == request.CourseId && c.IsPublished))
            return Error(404, "Không tìm thấy khóa học đang được công bố");
        var pending = await Db.CourseRegistrations.FirstOrDefaultAsync(r => r.StudentId == StudentId && r.CourseId == request.CourseId && r.Status == "Pending");
        if (pending != null)
            return Ok(await CourseRegistrationQueries.Project(Db.CourseRegistrations.Where(r => r.Id == pending.Id)).SingleAsync());
        if (await Db.Enrollments.AnyAsync(e => e.StudentId == StudentId && e.Class.CourseId == request.CourseId
            && (e.Status == "Active" || e.Status == "OnHold") && e.Class.EndDate >= AppTime.Today))
            return Error(409, "Bạn đã được xếp lớp đang học hoặc bảo lưu trong khóa này");
        var registration = new CourseRegistration { StudentId = StudentId, CourseId = request.CourseId, CreatedAt = AppTime.Now };
        Db.CourseRegistrations.Add(registration);
        await Db.SaveChangesAsync();
        var result = await CourseRegistrationQueries.Project(Db.CourseRegistrations.Where(r => r.Id == registration.Id)).SingleAsync();
        await tx.CommitAsync();
        return StatusCode(201, result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancel(int id)
    {
        await using var tx = await Db.Database.BeginTransactionAsync();
        await StudentLifecycle.LockAsync(Db, StudentId);
        var registration = await Db.CourseRegistrations.FirstOrDefaultAsync(r => r.Id == id && r.StudentId == StudentId);
        if (registration == null) return Error(404, "Không tìm thấy yêu cầu đăng ký");
        if (registration.Status != "Pending") return Error(409, "Yêu cầu đã được xử lý, vui lòng liên hệ trung tâm");
        registration.Status = "Cancelled";
        await Db.SaveChangesAsync();
        await tx.CommitAsync();
        return NoContent();
    }
}
