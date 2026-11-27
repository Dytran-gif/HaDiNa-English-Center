using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Common;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "admin")]
[Route("api/admin/course-registrations")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class CourseRegistrationsController(AppDbContext db, EnrollmentService enrollments) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(string status = "Pending", int page = 1, int pageSize = 10)
    {
        if (status is not ("Pending" or "Assigned" or "Cancelled")) return BadRequest(new { message = "Trạng thái không hợp lệ" });
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.CourseRegistrations.AsNoTracking().Where(r => r.Status == status && r.Student.DeletedAt == null);
        var total = await query.CountAsync();
        var items = await CourseRegistrationQueries.Project(query.OrderBy(r => r.CreatedAt).ThenBy(r => r.Id)
            .SlicePage(page, pageSize, total)).ToListAsync();
        return Ok(new PagedResult<CourseRegistrationResponse> { Items = items, TotalItems = total, Page = page, PageSize = pageSize });
    }

    [HttpPost("{id:int}/assign")]
    public async Task<IActionResult> Assign(int id, AssignCourseClassRequest request)
    {
        var registration = await db.CourseRegistrations.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id && r.Student.DeletedAt == null);
        if (registration == null) return NotFound(new { message = "Không tìm thấy yêu cầu đăng ký" });
        var result = await enrollments.EnrollAsync(registration.StudentId, request.ClassId, courseRegistrationId: id);
        return result.Success ? Ok(new { message = result.Message, enrollmentId = result.EnrollmentId })
            : StatusCode(result.StatusCode, new { message = result.Message });
    }
}
