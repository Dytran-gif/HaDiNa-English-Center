using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Dashboard học viên - viết ĐỘC LẬP (không theo khuôn Teacher/Admin), truy vấn thẳng AppDbContext.
// Chỉ dùng các bảng có sẵn trong DB, khớp với types/StudentTypes/MainTypes/GeneralTypes.ts:
//   Students, Users, Enrollments, Classes, Courses, ClassSchedules.
[Route("api/student/dashboard")]
public class DashboardController : StudentControllerBase
{
    public DashboardController(AppDbContext db) : base(db) { }

    // GET api/student/dashboard
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var student = await Db.Students.AsNoTracking()
            .Where(s => s.Id == StudentId)
            .Select(s => new { s.Id, s.Code, s.FullName, s.User.Email, s.User.AvatarUrl })
            .FirstAsync();

        // Lớp đang học hoặc sắp học (ghi danh Active, lớp chưa kết thúc). Mỗi lớp một thẻ (1 khóa có thể nhiều lớp).
        var now = AppTime.Now;
        var today = AppTime.Today;
        var rows = await LoadMyEnrollmentsAsync(e => e.Status == "Active" && e.Class.EndDate >= today);
        var courses = rows.Select(r => EnrollmentsController.ToDto(r, today).Course).ToList();

        // Lịch tuần kèm khoảng ngày của lớp (FE chỉ dùng để làm mới đồng hồ, buổi kế tiếp lấy từ nextLesson)
        var lessonSlots = rows.SelectMany(r => r.CalendarSlots.Select(s => new LessonSlotDto
            {
                CourseId = r.CourseId,
                ClassId = r.ClassId,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime
            }))
            .OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
            .ToList();

        // Buổi học kế tiếp gần nhất (trong khoảng ngày của lớp, chưa kết thúc)
        NextLessonInfoDto? nextLesson = null;
        foreach (var r in rows)
        {
            var next = ClassCalendar.Next(r.StartDate, r.EndDate, r.CalendarSlots, now);
            if (next == null) continue;
            if (nextLesson != null && (nextLesson.NextDate < next.Date
                || (nextLesson.NextDate == next.Date && nextLesson.StartTime <= next.Slot.StartTime))) continue;
            nextLesson = new NextLessonInfoDto
            {
                CourseId = r.CourseId,
                CourseName = r.CourseName,
                BandFrom = r.BandFrom.ToString("0.#"),
                BandTo = r.BandTo.ToString("0.#"),
                Description = r.Description ?? "",
                TotalSessions = r.CourseTotalSessions,
                ImageUrl = r.ImageUrl,
                NextDate = next.Date,
                StartTime = next.Slot.StartTime,
                EndTime = next.Slot.EndTime,
                ClassId = r.ClassId,
                ClassName = r.ClassName,
                TeacherName = r.TeacherName,
                RoomName = r.Slots.First(x => x.Slot == next.Slot).RoomName,
                SessionNo = next.Number,
                ClassTotalSessions = r.TotalSessions
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
            LessonSlots = lessonSlots,
            Courses = courses,
            // DB chưa có bảng thông báo -> rỗng
            Notifications = new List<NotificationItemDto>()
        });
    }
}
