using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services.StudentPortal;

public class StudentDashboardService
{
    private readonly AppDbContext _db;
    private readonly SessionService _sessions;

    public StudentDashboardService(AppDbContext db, SessionService sessions)
    {
        _db = db;
        _sessions = sessions;
    }

    public async Task<StudentDashboardDto> GetDashboardAsync(int userId, int studentId)
    {
        var now = AppTime.Now;
        var today = AppTime.Today;

        // 1. Thông tin học viên
        var student = await _db.Students.AsNoTracking()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        // 2. Lớp đang học
        var enrollments = await _db.Enrollments.AsNoTracking()
            .Include(e => e.Class)
                .ThenInclude(c => c.Course)
            .Include(e => e.Class)
                .ThenInclude(c => c.Teacher)
            .Where(e => e.StudentId == studentId && e.Status == "Active")
            .ToListAsync();

        var classIds = enrollments.Select(e => e.ClassId).ToList();

        // Đồng bộ lịch buổi học của các lớp đang học
        foreach (var classId in classIds)
        {
            await _sessions.SyncAsync(classId);
        }

        // 3. Lịch học hôm nay (Lớp học + 1 kèm 1)
        var todayClassSessions = await _db.ClassSessions.AsNoTracking()
            .Include(s => s.Class)
                .ThenInclude(c => c.Teacher)
            .Include(s => s.Room)
            .Where(s => classIds.Contains(s.ClassId) && s.Date == today && s.Status != "Cancelled")
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        var todayOneOnOnes = await _db.OneOnOneSessions.AsNoTracking()
            .Include(o => o.Teacher)
            .Where(o => o.StudentId == studentId && o.Date == today && o.Status == "Scheduled")
            .OrderBy(o => o.StartTime)
            .ToListAsync();

        var todaySchedule = todayClassSessions.Select(s => new StudentSessionDto
        {
            SessionId = s.Id,
            ClassId = s.ClassId,
            Kind = s.Type == "Makeup" ? "Makeup" : "Class",
            Title = s.Class.Name,
            SessionNo = s.SessionNo,
            Date = s.Date,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            RoomName = s.Room?.Name,
            TeacherName = s.Class.Teacher?.FullName,
            MeetingUrl = s.MeetingUrl ?? s.Class.MeetingUrl,
            Status = SessionService.StatusOf(today, s.StartTime, s.EndTime, now)
        }).Concat(todayOneOnOnes.Select(o => new StudentSessionDto
        {
            SessionId = o.Id,
            ClassId = 0,
            Kind = "OneOnOne",
            Title = $"1 kèm 1: {o.Topic}",
            SessionNo = 0,
            Date = o.Date,
            StartTime = o.StartTime,
            EndTime = o.EndTime,
            RoomName = null,
            TeacherName = o.Teacher.FullName,
            MeetingUrl = o.MeetingUrl,
            Status = SessionService.StatusOf(today, o.StartTime, o.EndTime, now)
        })).OrderBy(s => s.StartTime).ToList();

        // 4. Buổi học sắp tới gần nhất (hôm nay hoặc các ngày tới)
        var nextClassSession = await _db.ClassSessions.AsNoTracking()
            .Include(s => s.Class)
                .ThenInclude(c => c.Teacher)
            .Include(s => s.Class)
                .ThenInclude(c => c.Course)
            .Include(s => s.Room)
            .Where(s => classIds.Contains(s.ClassId) && s.Status == "Scheduled"
                && (s.Date > today || (s.Date == today && s.EndTime > TimeOnly.FromDateTime(now))))
            .OrderBy(s => s.Date).ThenBy(s => s.StartTime)
            .FirstOrDefaultAsync();

        StudentSessionDto? nextSession = null;
        if (nextClassSession != null)
        {
            nextSession = new StudentSessionDto
            {
                SessionId = nextClassSession.Id,
                ClassId = nextClassSession.ClassId,
                Kind = nextClassSession.Type == "Makeup" ? "Makeup" : "Class",
                Title = nextClassSession.Class.Name,
                SessionNo = nextClassSession.SessionNo,
                Date = nextClassSession.Date,
                StartTime = nextClassSession.StartTime,
                EndTime = nextClassSession.EndTime,
                RoomName = nextClassSession.Room?.Name,
                TeacherName = nextClassSession.Class.Teacher?.FullName,
                MeetingUrl = nextClassSession.MeetingUrl ?? nextClassSession.Class.MeetingUrl,
                Status = SessionService.StatusOf(nextClassSession.Date, nextClassSession.StartTime, nextClassSession.EndTime, now)
            };
        }

        // 5. Thống kê
        var pendingAssignmentsCount = await _db.Assignments.AsNoTracking()
            .Where(a => classIds.Contains(a.ClassId)
                && (a.AssignToAll || a.Targets.Any(t => t.StudentId == studentId))
                && !_db.Submissions.Any(s => s.AssignmentId == a.Id && s.StudentId == studentId))
            .CountAsync();

        var attendances = await _db.Attendances.AsNoTracking()
            .Where(a => a.StudentId == studentId)
            .Select(a => a.Status)
            .ToListAsync();

        double attendanceRate = attendances.Count > 0
            ? Math.Round((double)attendances.Count(a => a == "Present" || a == "Late") / attendances.Count * 100, 1)
            : 100.0;

        var latestSubmissionBand = await _db.Submissions.AsNoTracking()
            .Where(s => s.StudentId == studentId && s.Status == "Published" && s.OverallBand != null)
            .OrderByDescending(s => s.PublishedAt ?? s.SubmittedAt)
            .Select(s => s.OverallBand)
            .FirstOrDefaultAsync();

        var latestExamScore = await _db.ExamResults.AsNoTracking()
            .Where(r => r.StudentId == studentId && r.Score != null)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => r.Score)
            .FirstOrDefaultAsync();

        // 6. Danh sách khóa học đang theo học
        var courses = new List<StudentCourseDto>();
        foreach (var e in enrollments)
        {
            var course = e.Class.Course;
            var totalSessions = course.TotalSessions > 0 ? course.TotalSessions : 24;
            var pastSessions = await _db.ClassSessions.CountAsync(s => s.ClassId == e.ClassId && s.Date <= today && s.Status != "Cancelled");
            var progressPercent = Math.Min(100.0, Math.Round((double)pastSessions / totalSessions * 100, 1));

            courses.Add(new StudentCourseDto
            {
                Id = course.Id,
                ClassId = e.ClassId,
                Name = course.Name,
                ClassName = e.Class.Name,
                Description = course.Description,
                BandFrom = course.BandFrom,
                BandTo = course.BandTo,
                TotalSessions = totalSessions,
                SessionsPerWeek = course.SessionsPerWeek,
                Tuition = course.Tuition,
                DiscountPercent = course.DiscountPercent,
                ImageUrl = null,
                TeacherName = e.Class.Teacher?.FullName,
                ProgressPercent = progressPercent,
                StartDate = e.Class.StartDate,
                EndDate = e.Class.EndDate
            });
        }

        // 7. Thông tin bài học tiếp theo (PresentLesson)
        NextLessonInfoDto? nextLesson = null;
        if (nextClassSession != null)
        {
            var course = nextClassSession.Class.Course;
            nextLesson = new NextLessonInfoDto
            {
                ClassId = nextClassSession.ClassId,
                ClassName = nextClassSession.Class.Name,
                CourseName = course.Name,
                Description = course.Description,
                BandFrom = course.BandFrom,
                BandTo = course.BandTo,
                TotalSessions = course.TotalSessions,
                TeacherName = nextClassSession.Class.Teacher?.FullName,
                NextDate = nextClassSession.Date,
                StartTime = nextClassSession.StartTime,
                EndTime = nextClassSession.EndTime,
                RoomName = nextClassSession.Room?.Name,
                MeetingUrl = nextClassSession.MeetingUrl ?? nextClassSession.Class.MeetingUrl
            };
        }
        else if (courses.Count > 0)
        {
            var firstCourse = courses[0];
            nextLesson = new NextLessonInfoDto
            {
                ClassId = firstCourse.ClassId,
                ClassName = firstCourse.ClassName,
                CourseName = firstCourse.Name,
                Description = firstCourse.Description,
                BandFrom = firstCourse.BandFrom,
                BandTo = firstCourse.BandTo,
                TotalSessions = firstCourse.TotalSessions,
                TeacherName = firstCourse.TeacherName
            };
        }

        // 8. 5 bài tập sắp đến hạn
        var dueAssignments = await _db.Assignments.AsNoTracking()
            .Include(a => a.Class)
            .Where(a => classIds.Contains(a.ClassId)
                && (a.AssignToAll || a.Targets.Any(t => t.StudentId == studentId))
                && !_db.Submissions.Any(s => s.AssignmentId == a.Id && s.StudentId == studentId))
            .OrderBy(a => a.DueAt)
            .Take(5)
            .Select(a => new StudentDueAssignmentDto
            {
                Id = a.Id,
                ClassId = a.ClassId,
                ClassName = a.Class.Name,
                Title = a.Title,
                Skill = a.Skill,
                Type = a.Type,
                DueAt = a.DueAt,
                AllowLate = a.AllowLate
            })
            .ToListAsync();

        // 9. Kết quả mới nhất
        var recentResults = await _db.Submissions.AsNoTracking()
            .Include(s => s.Assignment)
            .Where(s => s.StudentId == studentId && s.Status == "Published")
            .OrderByDescending(s => s.PublishedAt ?? s.SubmittedAt)
            .Take(5)
            .Select(s => new StudentRecentResultDto
            {
                SubmissionId = s.Id,
                AssignmentId = s.AssignmentId,
                Title = s.Assignment.Title,
                Skill = s.Assignment.Skill,
                OverallBand = s.OverallBand,
                AutoScore = s.AutoScore,
                AutoMaxScore = s.AutoMaxScore,
                PublishedAt = s.PublishedAt
            })
            .ToListAsync();

        // 10. Thông báo
        var unreadNotificationsCount = await _db.Notifications
            .CountAsync(n => n.RecipientUserId == userId && !n.IsRead);

        var notificationItems = await _db.Notifications.AsNoTracking()
            .Where(n => n.RecipientUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(5)
            .Select(n => new StudentNotificationItemDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Content ?? "",
                Content = n.Content ?? "",
                Link = n.Link,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return new StudentDashboardDto
        {
            Student = new StudentInfoDto
            {
                Id = student?.Id ?? studentId,
                Code = student?.Code ?? "",
                FullName = student?.FullName ?? "",
                AvatarUrl = student?.User.AvatarUrl,
                TargetBand = student?.TargetBand
            },
            Stats = new StudentStatsDto
            {
                OngoingClasses = classIds.Count,
                PendingAssignments = pendingAssignmentsCount,
                AttendanceRate = attendanceRate,
                TargetBand = student?.TargetBand,
                LatestBand = latestSubmissionBand ?? latestExamScore
            },
            NextLesson = nextLesson,
            TodaySessions = todaySchedule,
            NextSession = nextSession,
            Courses = courses,
            DueAssignments = dueAssignments,
            RecentResults = recentResults,
            Notifications = new StudentNotificationsDto
            {
                UnreadCount = unreadNotificationsCount,
                Items = notificationItems
            }
        };
    }
}
