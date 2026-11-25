using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

// Duyệt đánh giá giáo viên của học viên trước khi hiện ở trang public.
[ApiController]
[Route("api/admin/reviews")]
[Authorize(Roles = "admin")]
public class ReviewsController(AppDbContext db) : ControllerBase
{
    public record AdminReviewItem(int Id, int Rating, string Comment, bool IsPublished, DateTime CreatedAt,
        int StudentId, string StudentCode, string StudentName, int ClassId, string ClassCode, string CourseName,
        int TeacherId, string TeacherName);

    // GET api/admin/reviews?status=pending|published&search=&page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetAll(string? status, string? search, int page = 1, int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = pageSize < 1 ? 10 : Math.Min(100, pageSize);
        var query = db.TeacherReviews.AsNoTracking()
            .WhereContains(search, r => r.Student.FullName, r => r.Teacher.FullName, r => r.Class.Code, r => r.Comment);
        if (status == "pending") query = query.Where(r => !r.IsPublished);
        else if (status == "published") query = query.Where(r => r.IsPublished);

        var total = await query.CountAsync();
        var items = await query.OrderBy(r => r.IsPublished).ThenByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(r => new AdminReviewItem(r.Id, r.Rating, r.Comment, r.IsPublished, r.CreatedAt,
                r.StudentId, r.Student.Code, r.Student.FullName, r.ClassId, r.Class.Code, r.Class.Course.Name,
                r.TeacherId, r.Teacher.FullName))
            .ToListAsync();
        return Ok(new PagedResult<AdminReviewItem> { Items = items, TotalItems = total, Page = page, PageSize = pageSize });
    }

    // POST api/admin/reviews/5/publish | /hide
    [HttpPost("{id:int}/publish")]
    public Task<IActionResult> Publish(int id) => SetPublished(id, true);

    [HttpPost("{id:int}/hide")]
    public Task<IActionResult> Hide(int id) => SetPublished(id, false);

    private async Task<IActionResult> SetPublished(int id, bool value)
    {
        var review = await db.TeacherReviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound(new { message = "Không tìm thấy đánh giá" });
        review.IsPublished = value;
        await db.SaveChangesAsync();
        return Ok(new { message = value ? "Đã hiển thị đánh giá trên website" : "Đã ẩn đánh giá" });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var review = await db.TeacherReviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound(new { message = "Không tìm thấy đánh giá" });
        db.TeacherReviews.Remove(review);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
