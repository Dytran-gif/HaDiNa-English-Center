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

// Lịch học của học viên (trang Schedule): thời khóa biểu tuần + lịch sử khóa đã qua.
// Viết độc lập, truy vấn thẳng AppDbContext, chỉ lấy lớp của học viên đang đăng nhập.
// Giới hạn DB: chưa có bảng semester, thông báo (AppNotification) và buổi hủy (ClassSessions)
// -> notices luôn rỗng; history = các ghi danh không còn Active (OnHold/Dropped).
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/schedule")]
public class ScheduleController : ControllerBase
{
    private static readonly string[] DayNames = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };

    private readonly AppDbContext _db;

    public ScheduleController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/student/schedule?date=yyyy-MM-dd - thời khóa biểu tuần chứa ngày date
    [HttpGet]
    public async Task<IActionResult> GetWeek(DateOnly? date)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var monday = AppTime.StartOfWeek(date ?? AppTime.Today);
        var days = Enumerable.Range(0, 7)
            .Select(i => monday.AddDays(i))
            .ToList();

        // Các lớp đang học (Active) + lịch tuần của từng lớp
        var rows = await _db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == studentId && e.Status == "Active")
            .Select(e => new
            {
                ClassId = e.ClassId,
                ClassName = e.Class.Name,
                StartDate = e.Class.StartDate,
                EndDate = e.Class.EndDate,
                TeacherName = e.Class.Teacher.FullName,
                CourseName = e.Class.Course.Name,
                Description = e.Class.Course.Description,
                BandFrom = e.Class.Course.BandFrom,
                BandTo = e.Class.Course.BandTo,
                TotalSessions = e.Class.Course.TotalSessions
            })
            .ToListAsync();

        var classIds = rows.Select(r => r.ClassId).ToList();
        var schedules = (await _db.ClassSchedules.AsNoTracking()
                .Where(s => classIds.Contains(s.ClassId))
                .Select(s => new
                {
                    s.ClassId,
                    s.DayOfWeek,
                    s.StartTime,
                    s.EndTime,
                    RoomName = s.Room != null ? s.Room.Name : null
                })
                .ToListAsync())
            .ToLookup(s => s.ClassId);

        var sessions = new List<StudentScheduleSessionDto>();

        foreach (var row in rows)
        {
            var classSchedules = schedules[row.ClassId].ToList();
            if (classSchedules.Count == 0) continue;

            var scheduleDays = classSchedules.Select(s => (int)s.DayOfWeek).Distinct().ToHashSet();

            foreach (var day in days)
            {
                // Chỉ hiện buổi trong khoảng lớp đang mở
                if (day < row.StartDate || day > row.EndDate) continue;

                var dayNo = AppTime.DayNo(day);
                foreach (var sch in classSchedules.Where(s => s.DayOfWeek == dayNo))
                {
                    var sessionNo = SessionNumber(row.StartDate, day, scheduleDays);

                    // Chưa bắt đầu hoặc đã học đủ số buổi thì không hiển thị
                    if (sessionNo == 0 || sessionNo > row.TotalSessions) continue;

                    sessions.Add(new StudentScheduleSessionDto
                    {
                        ClassId = row.ClassId.ToString(),
                        ClassName = row.ClassName,
                        CourseName = row.CourseName,
                        BandFrom = row.BandFrom.ToString("0.#"),
                        BandTo = row.BandTo.ToString("0.#"),
                        Description = row.Description ?? "",
                        TotalSessions = row.TotalSessions,
                        TeacherName = row.TeacherName,
                        RoomName = sch.RoomName ?? "",
                        DayOfWeek = DayNames[dayNo - 1],
                        DateStr = day.ToString("yyyy-MM-dd"),
                        StartTime = sch.StartTime.ToString("HH\\:mm"),
                        EndTime = sch.EndTime.ToString("HH\\:mm"),
                        SessionNo = sessionNo,
                        IsCancelled = false // DB chưa có bảng buổi hủy (ClassSessions)
                    });
                }
            }
        }

        return Ok(new StudentScheduleResponseDto
        {
            WeekStart = monday.ToString("yyyy-MM-dd"),
            WeekEnd = monday.AddDays(6).ToString("yyyy-MM-dd"),
            Days = days.Select((d, i) => new StudentScheduleDayDto
            {
                Key = DayNames[i],
                Label = DayNames[i],
                DateStr = d.ToString("yyyy-MM-dd")
            }).ToList(),
            Sessions = sessions,
            Notices = new List<StudentScheduleNoticeDto>()
        });
    }

    // GET api/student/schedule/history - khóa đã qua (ghi danh không còn Active)
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var rows = await _db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == studentId && e.Status != "Active")
            .OrderByDescending(e => e.Id)
            .Select(e => new
            {
                e.Id,
                e.Status,
                e.CreatedAt,
                ClassId = e.ClassId,
                ClassName = e.Class.Name,
                StartDate = e.Class.StartDate,
                EndDate = e.Class.EndDate,
                CourseName = e.Class.Course.Name,
                BandFrom = e.Class.Course.BandFrom,
                BandTo = e.Class.Course.BandTo,
                TotalSessions = e.Class.Course.TotalSessions,
                TeacherName = e.Class.Teacher.FullName
            })
            .ToListAsync();

        var items = rows.Select(e => new StudentScheduleHistoryItemDto
        {
            EnrollmentId = e.Id,
            Status = e.Status,
            RegisteredAt = e.CreatedAt.ToString("yyyy-MM-dd"),
            ClassId = e.ClassId.ToString(),
            ClassName = e.ClassName,
            StartDate = e.StartDate.ToString("yyyy-MM-dd"),
            EndDate = e.EndDate.ToString("yyyy-MM-dd"),
            CourseName = e.CourseName,
            Band = $"Band {e.BandFrom.ToString("0.#")} - {e.BandTo.ToString("0.#")}",
            TotalSessions = e.TotalSessions,
            TeacherName = e.TeacherName
        }).ToList();

        return Ok(items);
    }

    // Số buổi học đã diễn ra tính từ ngày khai giảng đến ngày target
    // (đếm các ngày trong khoảng trùng với ngày học trong tuần của lớp)
    private static int SessionNumber(DateOnly start, DateOnly target, HashSet<int> scheduleDays)
    {
        var count = 0;
        for (var d = start; d <= target; d = d.AddDays(1))
            if (scheduleDays.Contains(AppTime.DayNo(d)))
                count++;
        return count;
    }
}
