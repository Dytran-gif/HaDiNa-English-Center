using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.TeacherPortal;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Page 2 - Lịch dạy. Lịch lấy từ ClassSchedules do Admin tạo, giáo viên không sửa trực tiếp.
[Route("api/teacher/schedule")]
public class ScheduleController : TeacherControllerBase
{
    private readonly SessionService _sessions;

    public ScheduleController(AppDbContext db, SessionService sessions) : base(db)
    {
        _sessions = sessions;
    }

    // GET api/teacher/schedule?view=week&date=2026-11-04
    // GET api/teacher/schedule?view=month&date=2026-11-01
    // GET api/teacher/schedule?from=2026-11-02&to=2026-11-08
    // Trả về danh sách buổi (events) và nhóm theo ngày (days) để hiển thị dạng danh sách trên điện thoại
    [HttpGet]
    public async Task<IActionResult> Get(string? view, DateOnly? date, DateOnly? from, DateOnly? to,
        bool includeAvailability = false)
    {
        var today = AppTime.Today;
        var anchor = date ?? today;

        DateOnly start, end;
        if (from != null && to != null)
        {
            start = from.Value;
            end = to.Value;
        }
        else if (string.Equals(view, "month", StringComparison.OrdinalIgnoreCase))
        {
            start = new DateOnly(anchor.Year, anchor.Month, 1);
            end = start.AddMonths(1).AddDays(-1);
        }
        else
        {
            start = AppTime.StartOfWeek(anchor);
            end = start.AddDays(6);
        }

        if (end < start) return Error(400, "Khoảng ngày không hợp lệ");
        if (end.DayNumber - start.DayNumber > 62) return Error(400, "Chỉ xem tối đa 62 ngày một lần");

        await _sessions.SyncTeacherAsync(TeacherId);

        var events = await BuildEventsAsync(start, end);

        var availability = includeAvailability
            ? await Db.TeacherAvailabilities
                .Where(a => a.TeacherId == TeacherId && a.Date >= start && a.Date <= end)
                .OrderBy(a => a.Date).ThenBy(a => a.StartTime)
                .Select(a => new { a.Id, a.Date, a.StartTime, a.EndTime, a.Note, a.IsBooked })
                .ToListAsync()
            : null;

        var days = new List<object>();
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            var dayEvents = events.Where(e => e.Date == d).ToList();
            days.Add(new
            {
                date = d,
                dayOfWeek = AppTime.DayNo(d),
                isToday = d == today,
                events = dayEvents
            });
        }

        return Ok(new
        {
            from = start,
            to = end,
            today,
            previous = view?.ToLower() == "month" ? new DateOnly(start.Year, start.Month, 1).AddMonths(-1) : start.AddDays(-7),
            next = view?.ToLower() == "month" ? new DateOnly(start.Year, start.Month, 1).AddMonths(1) : start.AddDays(7),
            events,
            days,
            availability
        });
    }

    public class ScheduleEvent
    {
        public string Kind { get; set; } = "";        // Class (buổi thường) | Makeup (dạy bù) | OneOnOne (1 kèm 1)
        public int Id { get; set; }                   // SessionId hoặc OneOnOneSessionId
        public int? ClassId { get; set; }
        public string Title { get; set; } = "";
        public string? CourseName { get; set; }
        public int? SessionNo { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string? RoomName { get; set; }
        public int? EnrolledCount { get; set; }
        public int? MaxStudents { get; set; }
        public string? StudentName { get; set; }
        public string? MeetingUrl { get; set; }
        public string Status { get; set; } = "";      // Upcoming | Ongoing | Done | Cancelled
        public bool AttendanceTaken { get; set; }
    }

    private async Task<List<ScheduleEvent>> BuildEventsAsync(DateOnly start, DateOnly end)
    {
        var now = AppTime.Now;

        var sessions = await Db.ClassSessions
            .Where(s => s.Class.TeacherId == TeacherId && s.Date >= start && s.Date <= end)
            .Select(s => new
            {
                s.Id, s.ClassId, s.SessionNo, s.Date, s.StartTime, s.EndTime, s.Type, s.Status,
                s.MeetingUrl, ClassMeetingUrl = s.Class.MeetingUrl,
                ClassName = s.Class.Name, CourseName = s.Class.Course.Name,
                RoomName = s.Room != null ? s.Room.Name : null,
                Enrolled = s.Class.Enrollments.Count(e => e.Status == "Active"),
                s.Class.MaxStudents,
                s.AttendanceTakenAt
            })
            .ToListAsync();

        var events = sessions.Select(s => new ScheduleEvent
        {
            Kind = s.Type == "Makeup" ? "Makeup" : "Class",
            Id = s.Id,
            ClassId = s.ClassId,
            Title = s.ClassName,
            CourseName = s.CourseName,
            SessionNo = s.SessionNo,
            Date = s.Date,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            RoomName = s.RoomName,
            EnrolledCount = s.Enrolled,
            MaxStudents = s.MaxStudents,
            MeetingUrl = string.IsNullOrWhiteSpace(s.MeetingUrl) ? s.ClassMeetingUrl : s.MeetingUrl,
            Status = s.Status == "Cancelled" ? "Cancelled" : SessionService.StatusOf(s.Date, s.StartTime, s.EndTime, now),
            AttendanceTaken = s.AttendanceTakenAt != null
        }).ToList();

        var ones = await Db.OneOnOneSessions
            .Where(o => o.TeacherId == TeacherId && o.Date >= start && o.Date <= end)
            .Select(o => new { o.Id, o.Date, o.StartTime, o.EndTime, o.Status, o.Topic, o.MeetingUrl, o.Student.FullName })
            .ToListAsync();

        events.AddRange(ones.Select(o => new ScheduleEvent
        {
            Kind = "OneOnOne",
            Id = o.Id,
            Title = "1 kèm 1: " + o.FullName + (string.IsNullOrWhiteSpace(o.Topic) ? "" : " - " + o.Topic),
            StudentName = o.FullName,
            Date = o.Date,
            StartTime = o.StartTime,
            EndTime = o.EndTime,
            MeetingUrl = o.MeetingUrl,
            Status = o.Status == "Cancelled" ? "Cancelled" : SessionService.StatusOf(o.Date, o.StartTime, o.EndTime, now)
        }));

        return events.OrderBy(e => e.Date).ThenBy(e => e.StartTime).ToList();
    }

    // ---------- Lịch rảnh cho học viên đặt 1 kèm 1 ----------

    // GET api/teacher/schedule/availability?from=&to=
    [HttpGet("availability")]
    public async Task<IActionResult> GetAvailability(DateOnly? from, DateOnly? to)
    {
        var start = from ?? AppTime.Today;
        var end = to ?? start.AddDays(30);

        var items = await Db.TeacherAvailabilities
            .Where(a => a.TeacherId == TeacherId && a.Date >= start && a.Date <= end)
            .OrderBy(a => a.Date).ThenBy(a => a.StartTime)
            .Select(a => new { a.Id, a.Date, a.StartTime, a.EndTime, a.Note, a.IsBooked })
            .ToListAsync();
        return Ok(items);
    }

    // POST api/teacher/schedule/availability
    [HttpPost("availability")]
    public async Task<IActionResult> CreateAvailability(AvailabilityCreate req)
    {
        if (req.Date < AppTime.Today) return Error(400, "Không khai báo lịch rảnh cho ngày đã qua");

        await _sessions.SyncTeacherAsync(TeacherId);

        var created = new List<TeacherAvailability>();
        var skipped = new List<string>();
        for (var w = 0; w < req.RepeatWeeks; w++)
        {
            var date = req.Date.AddDays(7 * w);

            var clash = await FindClashAsync(date, req.StartTime, req.EndTime);
            var overlap = await Db.TeacherAvailabilities.AnyAsync(a => a.TeacherId == TeacherId && a.Date == date
                && a.StartTime < req.EndTime && a.EndTime > req.StartTime);
            if (clash != null || overlap)
            {
                skipped.Add($"{date:dd/MM/yyyy}: {(clash != null ? "trùng " + clash : "đã có khung rảnh trùng giờ")}");
                continue;
            }

            var a = new TeacherAvailability
            {
                TeacherId = TeacherId,
                Date = date,
                StartTime = req.StartTime,
                EndTime = req.EndTime,
                Note = req.Note?.Trim()
            };
            Db.TeacherAvailabilities.Add(a);
            created.Add(a);
        }

        if (created.Count == 0)
            return Error(409, "Không tạo được khung giờ nào. " + string.Join("; ", skipped));

        await Db.SaveChangesAsync();
        return StatusCode(201, new
        {
            created = created.Select(a => new { a.Id, a.Date, a.StartTime, a.EndTime, a.Note, a.IsBooked }),
            skipped
        });
    }

    // DELETE api/teacher/schedule/availability/5
    [HttpDelete("availability/{id}")]
    public async Task<IActionResult> DeleteAvailability(int id)
    {
        var a = await Db.TeacherAvailabilities.FirstOrDefaultAsync(x => x.Id == id && x.TeacherId == TeacherId);
        if (a == null) return Error(404, "Không tìm thấy khung giờ");
        if (a.IsBooked) return Error(409, "Khung giờ đã có học viên đặt, hãy hủy buổi 1 kèm 1 trước");

        if (await Db.StudentRequests.AnyAsync(r => r.AvailabilityId == id && r.Status == "Pending"))
            return Error(409, "Đang có yêu cầu đặt lịch chờ duyệt cho khung giờ này");

        Db.TeacherAvailabilities.Remove(a);
        await Db.SaveChangesAsync();
        return NoContent();
    }
}
