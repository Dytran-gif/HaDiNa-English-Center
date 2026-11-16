using EnglishCenter.Api.Data;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Tổng quan, lớp phụ trách, lịch dạy. Lịch sinh từ ClassSchedules (lịch tuần) trong khoảng ngày của lớp,
// giống cách trang Lịch học của Student, không lưu buổi học riêng.
[Route("api/teacher")]
public class TeacherClassesController : TeacherControllerBase
{
    private const int MaxScheduleDays = 62;

    public TeacherClassesController(AppDbContext db) : base(db) { }

    // GET api/teacher/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var today = AppTime.Today;
        var classes = await MyClasses.AsNoTracking()
            .Select(c => new { c.Id, c.StartDate, c.EndDate })
            .ToListAsync();
        var ongoing = classes.Count(c => ClassStatus(c.StartDate, c.EndDate, today) == "Ongoing");

        var studentCount = await MyEnrollments.Select(e => e.StudentId).Distinct().CountAsync();
        var assignmentCount = await Db.AssignmentFiles
            .CountAsync(a => a.FileType == "Teacher" && a.TeacherId == TeacherId);

        var weekAgo = AppTime.Now.AddDays(-7);
        var recent = await (
            from s in Db.AssignmentFiles
            where s.FileType == "Student" && s.TeacherId == TeacherId
            from st in Db.Students.Where(x => x.Id == s.StudentId)
            from a in Db.AssignmentFiles.Where(x => x.Id == s.AssignmentId).DefaultIfEmpty()
            orderby s.CreatedAt descending
            select new
            {
                s.Id, s.AssignmentId, AssignmentTitle = a != null ? a.Title : s.Title,
                StudentCode = st.Code, StudentName = st.FullName,
                SubmittedAt = s.CreatedAt, HasFile = s.FilePath != ""
            })
            .Take(8)
            .ToListAsync();
        var newSubmissions = await Db.AssignmentFiles
            .CountAsync(s => s.FileType == "Student" && s.TeacherId == TeacherId && s.CreatedAt >= weekAgo);

        // Buổi 7 ngày qua (tính cả hôm nay) chưa điểm danh
        var lastWeek = await EventsAsync(today.AddDays(-6), today);
        var unmarked = lastWeek.Where(e => !e.AttendanceMarked)
            .GroupBy(e => (e.ClassId, e.Date)).Select(g => g.First())
            .OrderByDescending(e => e.Date).ToList();

        return Ok(new
        {
            ClassCount = classes.Count,
            OngoingClassCount = ongoing,
            StudentCount = studentCount,
            AssignmentCount = assignmentCount,
            NewSubmissionCount = newSubmissions,
            Today = lastWeek.Where(e => e.Date == today).ToList(),
            UnmarkedSessions = unmarked,
            RecentSubmissions = recent
        });
    }

    // GET api/teacher/classes?status=Ongoing|Upcoming|Finished
    [HttpGet("classes")]
    public async Task<IActionResult> Classes(string? status)
    {
        var today = AppTime.Today;
        var rows = await MyClasses.AsNoTracking()
            .OrderByDescending(c => c.StartDate)
            .Select(c => new
            {
                c.Id, c.Name, c.CourseId, CourseName = c.Course.Name, c.StartDate, c.EndDate,
                c.MaxStudents, c.MeetingUrl,
                EnrolledCount = c.Enrollments.Count(e => e.Status == "Active"),
                Schedules = c.Schedules.OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
                    .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime, RoomName = s.Room.Name })
                    .ToList()
            })
            .ToListAsync();

        var items = rows
            .Select(c => new
            {
                c.Id, c.Name, c.CourseId, c.CourseName, c.StartDate, c.EndDate, c.MaxStudents, c.MeetingUrl,
                c.EnrolledCount, c.Schedules,
                Status = ClassStatus(c.StartDate, c.EndDate, today)
            })
            .Where(c => string.IsNullOrEmpty(status) || c.Status == status)
            .ToList();
        return Ok(items);
    }

    // GET api/teacher/classes/5 - thông tin lớp + danh sách học viên
    [HttpGet("classes/{id:int}")]
    public async Task<IActionResult> ClassDetail(int id)
    {
        var c = await MyClasses.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id, x.Name, x.CourseId, CourseName = x.Course.Name, x.StartDate, x.EndDate,
                x.MaxStudents, x.MeetingUrl, TotalSessions = x.Course.TotalSessions,
                Schedules = x.Schedules.OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
                    .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime, RoomName = s.Room.Name })
                    .ToList(),
                Students = x.Enrollments.OrderBy(e => e.Student.FullName)
                    .Select(e => new
                    {
                        e.Student.Id, e.Student.Code, e.Student.FullName, e.Student.Phone,
                        e.Student.User.Email, EnrollmentStatus = e.Status, EnrolledAt = e.CreatedAt
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
        if (c == null) return Error(404, "Không tìm thấy lớp hoặc bạn không phụ trách lớp này");

        return Ok(new
        {
            c.Id, c.Name, c.CourseId, c.CourseName, c.StartDate, c.EndDate, c.MaxStudents, c.MeetingUrl,
            c.TotalSessions, c.Schedules, c.Students,
            EnrolledCount = c.Students.Count(s => s.EnrollmentStatus == "Active"),
            Status = ClassStatus(c.StartDate, c.EndDate, AppTime.Today)
        });
    }

    // GET api/teacher/schedule?from=2026-11-09&to=2026-11-15 - các buổi dạy trong khoảng ngày
    [HttpGet("schedule")]
    public async Task<IActionResult> Schedule(DateOnly? from, DateOnly? to)
    {
        var start = from ?? AppTime.StartOfWeek(AppTime.Today);
        var end = to ?? start.AddDays(6);
        if (end < start) return Error(400, "Ngày kết thúc phải sau ngày bắt đầu");
        if (end.DayNumber - start.DayNumber >= MaxScheduleDays) return Error(400, $"Chỉ xem tối đa {MaxScheduleDays} ngày");

        return Ok(await EventsAsync(start, end));
    }

    private async Task<List<ScheduleEvent>> EventsAsync(DateOnly from, DateOnly to)
    {
        var slots = await Db.ClassSchedules.AsNoTracking()
            .Where(s => s.Class.TeacherId == TeacherId && s.Class.StartDate <= to && s.Class.EndDate >= from)
            .Select(s => new
            {
                s.ClassId, ClassName = s.Class.Name, CourseName = s.Class.Course.Name,
                s.Class.StartDate, s.Class.EndDate, s.Class.MeetingUrl,
                s.DayOfWeek, s.StartTime, s.EndTime, RoomName = s.Room.Name
            })
            .ToListAsync();

        // Ngày nào lớp đã được điểm danh (ít nhất 1 học viên)
        var marked = (await Db.Attendances.AsNoTracking()
                .Where(a => a.Class.TeacherId == TeacherId && a.Date >= from && a.Date <= to)
                .Select(a => new { a.ClassId, a.Date }).Distinct().ToListAsync())
            .Select(x => (x.ClassId, x.Date)).ToHashSet();

        var events = new List<ScheduleEvent>();
        for (var d = from; d <= to; d = d.AddDays(1))
        {
            var dayNo = AppTime.DayNo(d);
            events.AddRange(slots
                .Where(s => s.DayOfWeek == dayNo && d >= s.StartDate && d <= s.EndDate)
                .Select(s => new ScheduleEvent(d, s.ClassId, s.ClassName, s.CourseName,
                    s.StartTime, s.EndTime, s.RoomName, s.MeetingUrl, marked.Contains((s.ClassId, d)))));
        }
        // Lớp có 2 ca trong 1 ngày: điểm danh chung 1 lần/ngày nên giữ cả 2 ca, cùng trạng thái
        return events.OrderBy(e => e.Date).ThenBy(e => e.StartTime).ToList();
    }

    public record ScheduleEvent(DateOnly Date, int ClassId, string ClassName, string CourseName,
        TimeOnly StartTime, TimeOnly EndTime, string RoomName, string? MeetingUrl, bool AttendanceMarked);
}
