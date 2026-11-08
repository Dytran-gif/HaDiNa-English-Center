using EnglishCenter.Api.Data;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Page 1 - Dashboard: tổng hợp số liệu trong ngày từ các page khác
[Route("api/teacher/dashboard")]
public class DashboardController : TeacherControllerBase
{
    private readonly SessionService _sessions;
    private readonly StatsService _stats;

    public DashboardController(AppDbContext db, SessionService sessions, StatsService stats) : base(db)
    {
        _sessions = sessions;
        _stats = stats;
    }

    // GET api/teacher/dashboard
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var now = AppTime.Now;
        var today = AppTime.Today;
        await _sessions.SyncTeacherAsync(TeacherId);

        var ongoingClassIds = await MyClasses
            .Where(c => c.StartDate <= today && today <= c.EndDate)
            .Select(c => c.Id).ToListAsync();

        var activeStudents = await Db.Enrollments
            .Where(e => ongoingClassIds.Contains(e.ClassId) && e.Status == "Active")
            .Select(e => e.StudentId).Distinct().CountAsync();

        // ---------- Lịch dạy hôm nay ----------
        var todaySessions = await Db.ClassSessions
            .Where(s => s.Class.TeacherId == TeacherId && s.Date == today)
            .OrderBy(s => s.StartTime)
            .Select(s => new
            {
                s.Id, s.ClassId, ClassName = s.Class.Name, s.SessionNo, s.StartTime, s.EndTime, s.Type, s.Status,
                RoomName = s.Room != null ? s.Room.Name : null,
                Enrolled = s.Class.Enrollments.Count(e => e.Status == "Active"),
                s.Class.MaxStudents,
                s.AttendanceTakenAt
            })
            .ToListAsync();

        var todayOnes = await Db.OneOnOneSessions
            .Where(o => o.TeacherId == TeacherId && o.Date == today && o.Status == "Scheduled")
            .OrderBy(o => o.StartTime)
            .Select(o => new { o.Id, o.StartTime, o.EndTime, o.Topic, StudentName = o.Student.FullName, o.MeetingUrl })
            .ToListAsync();

        var schedule = todaySessions.Select(s => new
        {
            kind = s.Type == "Makeup" ? "Makeup" : "Class",
            sessionId = s.Id, s.ClassId, title = s.ClassName, s.SessionNo, s.StartTime, s.EndTime, s.RoomName,
            enrolledCount = (int?)s.Enrolled, maxStudents = (int?)s.MaxStudents,
            status = s.Status == "Cancelled" ? "Cancelled" : SessionService.StatusOf(today, s.StartTime, s.EndTime, now),
            attendanceTaken = s.AttendanceTakenAt != null
        }).Concat(todayOnes.Select(o => new
        {
            kind = "OneOnOne",
            sessionId = o.Id, ClassId = 0, title = "1 kèm 1: " + o.StudentName, SessionNo = 0, o.StartTime, o.EndTime,
            RoomName = (string?)null, enrolledCount = (int?)null, maxStudents = (int?)null,
            status = SessionService.StatusOf(today, o.StartTime, o.EndTime, now),
            attendanceTaken = false
        })).OrderBy(x => x.StartTime).ToList();

        // ---------- Bài chờ chấm ----------
        var overdueBefore = now.AddHours(-SubmissionService.GradingDueHours);
        var pendingSubs = Db.Submissions.Where(s => s.Assignment.Class.TeacherId == TeacherId
            && s.Assignment.Type != "Quiz"
            && (s.Status == "Submitted" || s.Status == "Draft")
            && !Db.Submissions.Any(o => o.AssignmentId == s.AssignmentId && o.StudentId == s.StudentId && o.AttemptNo > s.AttemptNo));

        var pendingCount = await pendingSubs.CountAsync();
        var grading = new
        {
            pending = pendingCount,
            overdue = await pendingSubs.CountAsync(s => s.SubmittedAt < overdueBefore),
            writing = await pendingSubs.CountAsync(s => s.Assignment.Type == "Writing"),
            speaking = await pendingSubs.CountAsync(s => s.Assignment.Type == "Speaking"),
            nextSubmissionId = await pendingSubs.OrderBy(s => s.SubmittedAt).ThenBy(s => s.Id)
                .Select(s => (int?)s.Id).FirstOrDefaultAsync()
        };

        // ---------- Học viên cần chú ý ----------
        var attendance = await _stats.AttendanceAsync(ongoingClassIds);
        var missing = await _stats.MissingAssignmentsAsync(ongoingClassIds);

        var roster = await Db.Enrollments
            .Where(e => ongoingClassIds.Contains(e.ClassId) && e.Status == "Active")
            .Select(e => new { e.StudentId, e.Student.Code, e.Student.FullName, e.ClassId, ClassName = e.Class.Name })
            .ToListAsync();
        var bands = await _stats.LatestBandsAsync(roster.Select(r => r.StudentId));

        var attention = new List<object>();
        var attentionClassIds = new List<int>();
        foreach (var r in roster)
        {
            var reasons = new List<string>();
            if (attendance.TryGetValue((r.ClassId, r.StudentId), out var a) && a.ConsecutiveAbsences >= 2)
                reasons.Add($"Vắng {a.ConsecutiveAbsences} buổi liên tiếp");
            var miss = missing.GetValueOrDefault((r.ClassId, r.StudentId));
            if (miss >= 2) reasons.Add($"Chưa nộp {miss} bài");
            if (bands.TryGetValue(r.StudentId, out var b) && b.Previous != null && b.Latest < b.Previous)
                reasons.Add($"Band giảm từ {b.Previous:0.0} xuống {b.Latest:0.0}");

            if (reasons.Count > 0)
            {
                attention.Add(new { r.StudentId, r.Code, r.FullName, r.ClassId, r.ClassName, reasons });
                attentionClassIds.Add(r.ClassId);
            }
        }

        // ---------- Yêu cầu chờ xử lý ----------
        var pendingRequests = await Db.StudentRequests
            .Where(r => r.TeacherId == TeacherId && r.Status == "Pending")
            .OrderBy(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id, r.Type, r.CreatedAt, r.Date, r.Reason,
                StudentName = r.Student.FullName, ClassName = r.Class != null ? r.Class.Name : null
            })
            .ToListAsync();

        // ---------- Lớp đang dạy: sĩ số, tiến độ, buổi tới ----------
        var nowTime = TimeOnly.FromDateTime(now);
        var classRows = await MyClasses
            .Where(c => ongoingClassIds.Contains(c.Id))
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id, c.Name, CourseName = c.Course.Name, c.MaxStudents, c.Course.TotalSessions,
                EnrolledCount = c.Enrollments.Count(e => e.Status == "Active")
            })
            .ToListAsync();

        var classSessions = await Db.ClassSessions
            .Where(x => ongoingClassIds.Contains(x.ClassId) && x.Status == "Scheduled")
            .Select(x => new { x.Id, x.ClassId, x.SessionNo, x.Date, x.StartTime, x.EndTime })
            .ToListAsync();

        var myClasses = classRows.Select(c =>
        {
            var sessions = classSessions.Where(x => x.ClassId == c.Id).ToList();
            var done = sessions.Count(x => AppTime.At(x.Date, x.EndTime) <= now);
            var next = sessions.Where(x => AppTime.At(x.Date, x.EndTime) > now)
                .OrderBy(x => x.Date).ThenBy(x => x.StartTime)
                .Select(x => new { sessionId = x.Id, x.SessionNo, x.Date, x.StartTime, x.EndTime })
                .FirstOrDefault();
            return new
            {
                c.Id, c.Name, c.CourseName, c.EnrolledCount, c.MaxStudents, c.TotalSessions,
                doneSessions = done,
                progressPercent = c.TotalSessions == 0 ? 0 : Math.Min(100, Math.Round(done * 100m / c.TotalSessions, 0)),
                nextSession = next,
                attentionCount = attentionClassIds.Count(id => id == c.Id)
            };
        }).ToList();

        // ---------- Hạn nộp bài trong 7 ngày tới ----------
        var deadlineTo = now.AddDays(7);
        var deadlineRows = await Db.Assignments
            .Where(a => a.Class.TeacherId == TeacherId && a.ExamId == null && a.DueAt >= now && a.DueAt <= deadlineTo)
            .OrderBy(a => a.DueAt)
            .Select(a => new
            {
                a.Id, a.Title, a.Skill, a.Type, a.DueAt, a.ClassId, ClassName = a.Class.Name, a.AssignToAll,
                ActiveCount = a.Class.Enrollments.Count(e => e.Status == "Active"),
                TargetCount = a.Targets.Count(t => a.Class.Enrollments.Any(e => e.StudentId == t.StudentId && e.Status == "Active")),
                SubmittedCount = a.Submissions.Select(x => x.StudentId).Distinct().Count()
            })
            .Take(10)
            .ToListAsync();
        var upcomingDeadlines = deadlineRows.Select(a => new
        {
            a.Id, a.Title, a.Skill, a.Type, a.DueAt, a.ClassId, a.ClassName,
            assignedCount = a.AssignToAll ? a.ActiveCount : a.TargetCount,
            a.SubmittedCount
        });

        // ---------- Buổi đã dạy nhưng chưa điểm danh (sẽ bị khóa sau 48 giờ) ----------
        var lockFrom = today.AddDays(-(SessionService.AttendanceLockHours / 24 + 1));
        var unmarkedRows = await Db.ClassSessions
            .Where(x => x.Class.TeacherId == TeacherId && x.Status == "Scheduled" && x.AttendanceTakenAt == null
                && x.Date >= lockFrom && (x.Date < today || (x.Date == today && x.EndTime <= nowTime)))
            .OrderBy(x => x.Date).ThenBy(x => x.StartTime)
            .Select(x => new { x.Id, x.ClassId, ClassName = x.Class.Name, x.SessionNo, x.Date, x.StartTime, x.EndTime })
            .ToListAsync();
        var unmarkedSessions = unmarkedRows
            .Select(x => new { x, lockAt = AppTime.At(x.Date, x.EndTime).AddHours(SessionService.AttendanceLockHours) })
            .Where(x => x.lockAt > now)
            .Select(x => new
            {
                sessionId = x.x.Id, x.x.ClassId, x.x.ClassName, x.x.SessionNo, x.x.Date, x.x.StartTime, x.x.EndTime,
                x.lockAt
            })
            .ToList();

        // ---------- Chuông thông báo ----------
        var unread = await Db.Notifications.CountAsync(n => n.RecipientUserId == UserId && !n.IsRead);
        var latestNotifications = await Db.Notifications
            .Where(n => n.RecipientUserId == UserId)
            .OrderByDescending(n => n.CreatedAt).Take(5)
            .Select(n => new { n.Id, n.Type, n.Title, n.Content, n.Link, n.IsRead, n.CreatedAt })
            .ToListAsync();

        // ---------- Lối tắt "Điểm danh buổi hôm nay" ----------
        // Buổi hôm nay đã/đang diễn ra mà chưa điểm danh; nếu không có thì buổi sắp tới gần nhất hôm nay
        var toMark = todaySessions
            .Where(s => s.Status == "Scheduled" && s.AttendanceTakenAt == null
                && AppTime.At(today, s.StartTime).AddMinutes(-SessionService.AttendanceOpenMinutesBefore) <= now)
            .OrderByDescending(s => s.StartTime).FirstOrDefault()
            ?? todaySessions.Where(s => s.Status == "Scheduled" && s.AttendanceTakenAt == null)
                .OrderBy(s => s.StartTime).FirstOrDefault();

        return Ok(new
        {
            today,
            teacherName = TeacherName,
            stats = new
            {
                ongoingClasses = ongoingClassIds.Count,
                activeStudents,
                sessionsToday = schedule.Count(x => x.status != "Cancelled"),
                pendingGrading = pendingCount
            },
            todaySchedule = schedule,
            grading,
            attentionStudents = attention,
            myClasses,
            upcomingDeadlines,
            unmarkedSessions,
            pendingRequests = new { count = pendingRequests.Count, items = pendingRequests.Take(10) },
            notifications = new { unreadCount = unread, latest = latestNotifications },
            shortcuts = new
            {
                attendanceSessionId = toMark?.Id,
                attendanceClassId = toMark?.ClassId,
                nextSubmissionId = grading.nextSubmissionId
            }
        });
    }
}
