using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Lịch học của học viên: thời khóa biểu tuần (mỗi buổi kèm mã lớp, link online, trạng thái điểm danh)
// + lịch sử khóa học (lớp đã học xong hoặc đã nghỉ). Buổi học tính bằng ClassCalendar giống cổng Giáo viên.
// DB chưa có bảng thông báo / buổi hủy -> notices rỗng, isCancelled = false.
[Route("api/student/schedule")]
public class ScheduleController : StudentControllerBase
{
    private static readonly string[] DayNames = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };

    public ScheduleController(AppDbContext db) : base(db) { }

    // GET api/student/schedule?date=yyyy-MM-dd - thời khóa biểu tuần chứa ngày date
    [HttpGet]
    public async Task<IActionResult> GetWeek(DateOnly? date)
    {
        var monday = AppTime.StartOfWeek(date ?? AppTime.Today);
        var sunday = monday.AddDays(6);
        var days = Enumerable.Range(0, 7).Select(i => monday.AddDays(i)).ToList();

        var rows = await LoadMyEnrollmentsAsync(e => e.Status == "Active"
            && e.Class.StartDate <= sunday && e.Class.EndDate >= monday);
        var classIds = rows.Select(r => r.ClassId).ToList();

        var attendance = (await Db.Attendances.AsNoTracking()
                .Where(a => a.StudentId == StudentId && classIds.Contains(a.ClassId) && a.Date >= monday && a.Date <= sunday)
                .Select(a => new { a.ClassId, a.Date, a.Status, a.Note })
                .ToListAsync())
            .ToDictionary(a => (a.ClassId, a.Date));

        // Bài tập GV giao trong tuần (và 7 ngày trước) cho từng lớp
        var since = monday.AddDays(-7).ToDateTime(TimeOnly.MinValue);
        var until = sunday.AddDays(1).ToDateTime(TimeOnly.MinValue);
        var assignmentDates = new Dictionary<int, List<DateOnly>>();
        foreach (var r in rows)
        {
            assignmentDates[r.ClassId] = (await AssignmentsFor(r.Ref).AsNoTracking()
                    .Where(a => a.CreatedAt >= since && a.CreatedAt < until)
                    .Select(a => a.CreatedAt).ToListAsync())
                .Select(DateOnly.FromDateTime).ToList();
        }

        var sessions = new List<StudentScheduleSessionDto>();
        foreach (var r in rows)
        {
            var total = r.TotalSessions;
            foreach (var s in ClassCalendar.Sessions(r.StartDate, r.EndDate, r.CalendarSlots).Where(s => s.Date >= monday && s.Date <= sunday))
            {
                var room = r.Slots.First(x => x.Slot == s.Slot).RoomName;
                attendance.TryGetValue((r.ClassId, s.Date), out var att);
                sessions.Add(new StudentScheduleSessionDto
                {
                    ClassId = r.ClassId.ToString(),
                    ClassName = r.ClassName,
                    CourseName = r.CourseName,
                    BandFrom = r.BandFrom.ToString("0.#"),
                    BandTo = r.BandTo.ToString("0.#"),
                    Description = r.Description ?? "",
                    TotalSessions = total,
                    TeacherName = r.TeacherName,
                    RoomName = room,
                    DayOfWeek = DayNames[AppTime.DayNo(s.Date) - 1],
                    DateStr = s.Date.ToString("yyyy-MM-dd"),
                    StartTime = s.Slot.StartTime.ToString("HH\\:mm"),
                    EndTime = s.Slot.EndTime.ToString("HH\\:mm"),
                    SessionNo = s.Number,
                    AttendanceStatus = att?.Status,
                    AttendanceNote = att?.Note,
                    NewAssignments = assignmentDates[r.ClassId].Count(d => d <= s.Date && d > s.Date.AddDays(-7)),
                    IsCancelled = false
                });
            }
        }

        return Ok(new StudentScheduleResponseDto
        {
            WeekStart = monday.ToString("yyyy-MM-dd"),
            WeekEnd = sunday.ToString("yyyy-MM-dd"),
            Days = days.Select((d, i) => new StudentScheduleDayDto
            {
                Key = DayNames[i],
                Label = DayNames[i],
                DateStr = d.ToString("yyyy-MM-dd")
            }).ToList(),
            Sessions = sessions.OrderBy(s => s.DateStr).ThenBy(s => s.StartTime).ToList(),
            Notices = new List<StudentScheduleNoticeDto>()
        });
    }

    // GET api/student/schedule/history - lịch sử khóa học: lớp đã học xong (EndDate đã qua) hoặc ghi danh đã nghỉ/bảo lưu.
    // Mỗi mục kèm chuyên cần, bài tập đã nộp, số nhận xét của GV (FE nhóm theo năm thành "thư mục").
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var today = AppTime.Today;
        var rows = (await LoadMyEnrollmentsAsync(e => e.Status != "Active" || e.Class.EndDate < today))
            .OrderByDescending(r => r.EndDate).ToList();
        var classIds = rows.Select(r => r.ClassId).ToList();

        var att = await Db.Attendances.AsNoTracking()
            .Where(a => a.StudentId == StudentId && classIds.Contains(a.ClassId))
            .GroupBy(a => a.ClassId)
            .Select(g => new
            {
                ClassId = g.Key, Marked = g.Count(),
                Attended = g.Count(a => a.Status == "Present" || a.Status == "Late")
            })
            .ToDictionaryAsync(x => x.ClassId);

        var feedback = await Db.StudentFeedbacks.AsNoTracking()
            .Where(f => f.StudentId == StudentId && classIds.Contains(f.ClassId))
            .GroupBy(f => f.ClassId)
            .Select(g => new { ClassId = g.Key, Count = g.Count(), Last = g.Max(f => f.CreatedAt) })
            .ToDictionaryAsync(x => x.ClassId);

        var items = new List<StudentScheduleHistoryItemDto>();
        foreach (var e in rows)
        {
            var assignmentIds = await AssignmentsFor(e.Ref).Select(a => a.Id).ToListAsync();
            var submitted = await Db.AssignmentFiles.AsNoTracking()
                .Where(s => s.FileType == "Student" && s.StudentId == StudentId && s.AssignmentId != null
                    && assignmentIds.Contains(s.AssignmentId.Value))
                .Select(s => s.AssignmentId).Distinct().CountAsync();

            att.TryGetValue(e.ClassId, out var a);
            feedback.TryGetValue(e.ClassId, out var f);
            items.Add(new StudentScheduleHistoryItemDto
            {
                EnrollmentId = e.EnrollmentId,
                Status = e.Status,
                ClassStatus = e.ClassStatus(today),
                Year = e.EndDate.Year,
                RegisteredAt = e.CreatedAt.ToString("yyyy-MM-dd"),
                ClassId = e.ClassId.ToString(),

                ClassName = e.ClassName,
                StartDate = e.StartDate.ToString("yyyy-MM-dd"),
                EndDate = e.EndDate.ToString("yyyy-MM-dd"),
                CourseName = e.CourseName,
                Band = $"Band {e.BandFrom:0.#} - {e.BandTo:0.#}",
                TotalSessions = e.TotalSessions,
                TeacherName = e.TeacherName,
                AttendedSessions = a?.Attended ?? 0,
                MarkedSessions = a?.Marked ?? 0,
                AssignmentCount = assignmentIds.Count,
                SubmittedCount = submitted,
                FeedbackCount = f?.Count ?? 0,
                LastFeedbackAt = f?.Last.ToString("yyyy-MM-dd")
            });
        }

        return Ok(items);
    }
}
