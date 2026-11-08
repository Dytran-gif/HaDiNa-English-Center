using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Dashboard học viên - viết ĐỘC LẬP (không theo khuôn Teacher/Admin), truy vấn thẳng AppDbContext.
// Chỉ dùng các bảng có sẵn trong DB, khớp với types/StudentTypes/MainTypes/GeneralTypes.ts:
//   Students, Users, Enrollments, Classes, Courses, ClassSchedules.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/student/dashboard
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        // ---------- Hồ sơ học viên ----------
        var student = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => new
            {
                s.Id,
                s.Code,
                s.FullName,
                s.User.Email,
                s.User.AvatarUrl
            })
            .FirstOrDefaultAsync();

        if (student == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        // ---------- Khóa học đang học: Enrollment (Active) -> Classes -> Courses ----------
        var enrollments = await _db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == student.Id && e.Status == "Active")
            .OrderBy(e => e.Class.StartDate)
            .Select(e => new
            {
                ClassId = e.ClassId,
                CourseId = e.Class.CourseId,
                CourseName = e.Class.Course.Name,
                Description = e.Class.Course.Description,
                BandFrom = e.Class.Course.BandFrom,
                BandTo = e.Class.Course.BandTo,
                TotalSessions = e.Class.Course.TotalSessions,
                SessionsPerWeek = e.Class.Course.SessionsPerWeek,
                Tuition = e.Class.Course.Tuition,
                DiscountPercent = e.Class.Course.DiscountPercent
            })
            .ToListAsync();

        var courses = enrollments.Select(e => new CourseItemDto
        {
            Id = e.CourseId.ToString(),
            Name = e.CourseName,
            Description = e.Description ?? "",
            BandFrom = e.BandFrom.ToString("0.#"),
            BandTo = e.BandTo.ToString("0.#"),
            TotalSessions = e.TotalSessions,
            SessionsPerWeek = e.SessionsPerWeek,
            Tuition = e.Tuition,
            DiscountPercent = e.DiscountPercent,
            ImageUrl = null // bảng Courses chưa có cột ảnh
        }).ToList();

        // ---------- Khối "Your next lesson": buổi học sắp tới GẦN NHẤT theo lịch tuần ----------
        // Với mỗi lớp đang học, tính buổi kế tiếp theo ClassSchedules (DayOfWeek 1=Thứ 2 .. 7=CN),
        // rồi chọn lớp có buổi sớm nhất so với bây giờ. Kèm ngày và giờ học.
        var now = AppTime.Now;
        var today = AppTime.Today;
        var todayDayNo = AppTime.DayNo(today);
        var nowTime = TimeOnly.FromDateTime(now);

        var classIds = enrollments.Select(e => e.ClassId).ToList();
        var schedules = (await _db.ClassSchedules.AsNoTracking()
                .Where(s => classIds.Contains(s.ClassId))
                .Select(s => new { s.ClassId, s.DayOfWeek, s.StartTime, s.EndTime })
                .ToListAsync())
            .ToLookup(s => s.ClassId);

        NextLessonInfoDto? nextLesson = null;
        DateOnly? bestDate = null;
        TimeOnly? bestStart = null;

        foreach (var e in enrollments)
        {
            foreach (var s in schedules[e.ClassId])
            {
                var diff = s.DayOfWeek - todayDayNo;
                if (diff < 0 || (diff == 0 && s.StartTime <= nowTime)) diff += 7;
                var nextDate = today.AddDays(diff);

                if (bestDate == null || nextDate < bestDate
                    || (nextDate == bestDate && s.StartTime < bestStart))
                {
                    bestDate = nextDate;
                    bestStart = s.StartTime;
                    nextLesson = new NextLessonInfoDto
                    {
                        CourseName = e.CourseName,
                        BandFrom = e.BandFrom.ToString("0.#"),
                        BandTo = e.BandTo.ToString("0.#"),
                        Description = e.Description ?? "",
                        TotalSessions = e.TotalSessions,
                        ImageUrl = null,
                        NextDate = nextDate,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime
                    };
                }
            }
        }

        // Không có lịch tuần thì lấy khóa đang học đầu tiên (không kèm giờ)
        if (nextLesson == null && courses.Count > 0)
        {
            var first = courses[0];
            nextLesson = new NextLessonInfoDto
            {
                CourseName = first.Name,
                BandFrom = first.BandFrom,
                BandTo = first.BandTo,
                Description = first.Description,
                TotalSessions = first.TotalSessions,
                ImageUrl = first.ImageUrl
            };
        }

        return Ok(new StudentDashboardDto
        {
            Student = new StudentInfoDto
            {
                Id = student.Id.ToString(),
                Code = student.Code,
                FullName = student.FullName,
                Email = student.Email,
                AvatarUrl = student.AvatarUrl
            },
            NextLesson = nextLesson,
            Courses = courses,
            // ⚠️ DB CHƯA CÓ bảng thông báo (xem type AppNotification trong GeneralTypes.ts) -> trả rỗng.
            // => KHI THÊM BẢNG THÔNG BÁO VÀO DB: truy vấn thông báo của học viên (chung + theo lớp
            //    đang học) rồi gán vào Notifications ở đây.
            Notifications = new List<NotificationItemDto>()
        });
    }
}
