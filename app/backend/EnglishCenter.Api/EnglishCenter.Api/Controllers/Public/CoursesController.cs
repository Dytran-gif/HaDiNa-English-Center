using EnglishCenter.Api.Data;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Public;

// Khóa học thật trong DB (Admin quản lý) + các lớp đang mở. Trang Khóa học public giữ nội dung giới thiệu,
// phần "Lớp đang mở" lấy từ đây theo slug (Admin đặt slug khóa trùng đường dẫn trang giới thiệu).
[ApiController]
[AllowAnonymous]
[Route("api/public/courses")]
public class CoursesController(AppDbContext db) : ControllerBase
{
    private async Task<List<object>> BuildAsync(IQueryable<EnglishCenter.Api.Entities.Course> query, CancellationToken ct)
    {
        var today = AppTime.Today;
        var courses = await query.AsNoTracking().Where(c => c.IsPublished).OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id, c.Code, c.Slug, c.Name, c.Description, c.BandFrom, c.BandTo, c.TotalSessions, c.SessionsPerWeek,
                c.Tuition, c.DiscountPercent, c.ImageUrl,
                Classes = c.Classes.Where(x => x.EndDate >= today).OrderBy(x => x.StartDate)
                    .Select(x => new
                    {
                        x.Id, x.Name, x.StartDate, x.EndDate, x.MaxStudents, TeacherName = x.Teacher.FullName,
                        TeacherSlug = db.PublicTeacherProfiles.Where(p => p.TeacherId == x.TeacherId && p.IsPublished)
                            .Select(p => p.Slug).FirstOrDefault(),
                        Enrolled = x.Enrollments.Count(e => e.Status == "Active"),
                        Slots = x.Schedules.OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
                            .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime }).ToList()
                    }).ToList()
            })
            .ToListAsync(ct);

        return courses.Select(c => (object)new
        {
            course_id = c.Id, code = c.Code, slug = c.Slug, course_name = c.Name, description = c.Description ?? "",
            band_from = c.BandFrom, band_to = c.BandTo, total_sessions = c.TotalSessions, sessions_per_week = c.SessionsPerWeek,
            price = c.Tuition, discount_percent = c.DiscountPercent,
            final_price = EnrollmentService.Quote(c.Tuition, c.DiscountPercent, 0, 1, 1, false, null).FinalTuitionFee,
            image = c.ImageUrl,
            open_classes = c.Classes.Select(x => new
            {
                id = x.Id, name = x.Name, start_date = x.StartDate, end_date = x.EndDate,
                status = ClassCalendar.Status(x.StartDate, x.EndDate, today),
                teacher_name = x.TeacherName, teacher_slug = x.TeacherSlug,
                seats_left = Math.Max(0, x.MaxStudents - x.Enrolled),
                schedule = string.Join(" · ", x.Slots.GroupBy(s => (s.StartTime, s.EndTime)).Select(g =>
                    string.Join(", ", g.Select(s => s.DayOfWeek == 7 ? "CN" : $"T{s.DayOfWeek + 1}"))
                    + $" {g.Key.StartTime:HH\\:mm}–{g.Key.EndTime:HH\\:mm}"))
            }).ToList()
        }).ToList();
    }

    // GET api/public/courses
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await BuildAsync(db.Courses, ct));

    // GET api/public/courses/{slug}
    [HttpGet("{slug}")]
    public async Task<IActionResult> Detail(string slug, CancellationToken ct)
    {
        var items = await BuildAsync(db.Courses.Where(c => c.Slug == slug), ct);
        return items.Count == 0 ? NotFound(new { message = "Không tìm thấy khóa học." }) : Ok(items[0]);
    }
}
