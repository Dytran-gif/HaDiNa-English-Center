using EnglishCenter.Api.Data;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Public;

// Trang Giáo viên của website. Hồ sơ gắn giáo viên thật (TeacherId) lấy tên/ảnh từ tài khoản giáo viên,
// khóa phụ trách từ các lớp thật, điểm đánh giá từ TeacherReviews đã duyệt — cùng nguồn với cổng Giáo viên.
// Only linked operational teachers are public; orphan/legacy profiles never appear.
[ApiController]
[AllowAnonymous]
[Route("api/public/teachers")]
public class TeachersController(AppDbContext db) : ControllerBase
{
    private record Row(int Id, int? TeacherId, string Slug, string FullName, string Title, string Bio, string Degree,
        string? AvatarUrl, string Specialty, string? TeachingExperience);

    private async Task<List<object>> BuildAsync(IQueryable<EnglishCenter.Api.Entities.PublicTeacherProfile> query, CancellationToken ct)
    {
        var rows = await query.AsNoTracking()
            .Where(p => p.IsPublished && p.TeacherId != null && p.Teacher!.Status == "Teaching" && !p.Teacher.User.IsLocked)
            .OrderBy(p => p.TeacherId == null).ThenBy(p => p.Id)
            .Select(p => new Row(p.Id, p.TeacherId, p.Slug,
                p.Teacher!.FullName,
                string.IsNullOrEmpty(p.Teacher!.Degree) ? p.Teacher.Specialty : p.Teacher.Degree, p.Bio,
                p.Teacher.Degree != null ? p.Teacher.Degree : "",
                p.Teacher.User.AvatarUrl, p.Teacher.Specialty, p.Teacher.TeachingExperience))
            .ToListAsync(ct);

        var teacherIds = rows.Where(r => r.TeacherId != null).Select(r => r.TeacherId!.Value).ToList();
        var today = AppTime.Today;
        var courses = await db.Classes.AsNoTracking()
            .Where(c => teacherIds.Contains(c.TeacherId) && c.Course.IsPublished)
            .Select(c => new { c.TeacherId, c.CourseId, c.Course.Name, c.Course.Slug, Open = c.EndDate >= today })
            .ToListAsync(ct);
        var ratings = await db.TeacherReviews.AsNoTracking()
            .Where(r => r.IsPublished && teacherIds.Contains(r.TeacherId))
            .GroupBy(r => r.TeacherId)
            .Select(g => new { TeacherId = g.Key, Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .ToDictionaryAsync(x => x.TeacherId, ct);

        return rows.Select(p =>
        {
            var mine = p.TeacherId == null ? [] : courses.Where(c => c.TeacherId == p.TeacherId).ToList();
            ratings.TryGetValue(p.TeacherId ?? 0, out var rating);
            return (object)new
            {
                teacher_id = p.TeacherId!.Value,
                account_teacher_id = p.TeacherId,
                slug = p.Slug,
                full_name = p.FullName,
                title = p.Title,
                degree = p.Degree,
                specialty = p.Specialty,
                teaching_experience = p.TeachingExperience,
                bio = p.Bio,
                credentials = string.IsNullOrWhiteSpace(p.Degree) ? Array.Empty<string>() : new[] { p.Degree },
                initials = Codes.Initials(p.FullName),
                avatar = p.AvatarUrl,
                courses = mine.GroupBy(c => c.CourseId).Select(g => new
                {
                    course_id = g.Key, name = g.First().Name, slug = g.First().Slug, has_open_class = g.Any(c => c.Open)
                }).ToList(),
                rating = rating == null ? (double?)null : Math.Round(rating.Avg, 1),
                review_count = rating?.Count ?? 0
            };
        }).ToList();
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) =>
        Ok(await BuildAsync(db.PublicTeacherProfiles, ct));

    [HttpGet("{slug}")]
    public async Task<IActionResult> Detail(string slug, CancellationToken ct)
    {
        var items = await BuildAsync(db.PublicTeacherProfiles.Where(x => x.Slug == slug), ct);
        return items.Count == 0 ? NotFound(new { message = "Không tìm thấy hồ sơ giáo viên." }) : Ok(items[0]);
    }

}
