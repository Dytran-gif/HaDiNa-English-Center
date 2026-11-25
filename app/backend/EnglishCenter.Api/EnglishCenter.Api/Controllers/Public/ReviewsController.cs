using EnglishCenter.Api.Data;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Public;

// Đánh giá giáo viên đã được Admin duyệt, kèm tên viết tắt của học viên đánh giá + lớp/khóa.
[ApiController]
[AllowAnonymous]
[Route("api/public/reviews")]
public class ReviewsController(AppDbContext db) : ControllerBase
{
    // GET api/public/reviews?teacherSlug=&limit=12
    [HttpGet]
    public async Task<IActionResult> List(string? teacherSlug, int limit = 12, CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 50);
        var query = db.TeacherReviews.AsNoTracking().Where(r => r.IsPublished);
        if (!string.IsNullOrWhiteSpace(teacherSlug))
        {
            var teacherId = await db.PublicTeacherProfiles.Where(p => p.Slug == teacherSlug && p.IsPublished)
                .Select(p => p.TeacherId).FirstOrDefaultAsync(ct);
            if (teacherId == null) return Ok(Array.Empty<object>());
            query = query.Where(r => r.TeacherId == teacherId);
        }
        var rows = await query.OrderByDescending(r => r.CreatedAt).Take(limit)
            .Select(r => new
            {
                r.Id, r.Rating, r.Comment, r.CreatedAt, StudentName = r.Student.FullName,
                ClassCode = r.Class.Code, CourseName = r.Class.Course.Name, TeacherName = r.Teacher.FullName,
                TeacherSlug = db.PublicTeacherProfiles.Where(p => p.TeacherId == r.TeacherId).Select(p => p.Slug).FirstOrDefault()
            })
            .ToListAsync(ct);
        return Ok(rows.Select(r => new
        {
            review_id = r.Id, rating = r.Rating, comment = r.Comment, created_at = r.CreatedAt,
            author_name = Codes.ShortName(r.StudentName), class_code = r.ClassCode, course_name = r.CourseName,
            teacher_name = r.TeacherName, teacher_slug = r.TeacherSlug
        }));
    }
}
