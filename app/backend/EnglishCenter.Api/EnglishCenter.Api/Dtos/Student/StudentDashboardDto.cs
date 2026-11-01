namespace EnglishCenter.Api.Dtos.StudentPortal;

public class StudentDashboardDto
{
    public StudentInfoDto Student { get; set; } = new();
    public StudentStatsDto Stats { get; set; } = new();
    public NextLessonInfoDto? NextLesson { get; set; }
    public List<StudentSessionDto> TodaySessions { get; set; } = new();
    public StudentSessionDto? NextSession { get; set; }
    public List<StudentCourseDto> Courses { get; set; } = new();
    public List<StudentDueAssignmentDto> DueAssignments { get; set; } = new();
    public List<StudentRecentResultDto> RecentResults { get; set; } = new();
    public StudentNotificationsDto Notifications { get; set; } = new();
}

public class StudentInfoDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public decimal? TargetBand { get; set; }
}

public class StudentStatsDto
{
    public int OngoingClasses { get; set; }
    public int PendingAssignments { get; set; }
    public double AttendanceRate { get; set; }
    public decimal? TargetBand { get; set; }
    public decimal? LatestBand { get; set; }
}

public class NextLessonInfoDto
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string? Description { get; set; }
    public decimal BandFrom { get; set; }
    public decimal BandTo { get; set; }
    public int TotalSessions { get; set; }
    public string? ImageUrl { get; set; }
    public string? TeacherName { get; set; }
    public DateOnly? NextDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? RoomName { get; set; }
    public string? MeetingUrl { get; set; }
}

public class StudentSessionDto
{
    public int SessionId { get; set; }
    public int ClassId { get; set; }
    public string Kind { get; set; } = "Class"; // Class | Makeup | OneOnOne
    public string Title { get; set; } = "";
    public int SessionNo { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string? RoomName { get; set; }
    public string? TeacherName { get; set; }
    public string? MeetingUrl { get; set; }
    public string Status { get; set; } = "Upcoming"; // Upcoming | Ongoing | Done | Cancelled
}

public class StudentCourseDto
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string Name { get; set; } = "";
    public string ClassName { get; set; } = "";
    public string? Description { get; set; }
    public decimal BandFrom { get; set; }
    public decimal BandTo { get; set; }
    public int TotalSessions { get; set; }
    public int SessionsPerWeek { get; set; }
    public decimal Tuition { get; set; }
    public decimal DiscountPercent { get; set; }
    public string? ImageUrl { get; set; }
    public string? TeacherName { get; set; }
    public double ProgressPercent { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}

public class StudentDueAssignmentDto
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public string Title { get; set; } = "";
    public string Skill { get; set; } = "";
    public string Type { get; set; } = "";
    public DateTime DueAt { get; set; }
    public bool AllowLate { get; set; }
}

public class StudentRecentResultDto
{
    public int SubmissionId { get; set; }
    public int AssignmentId { get; set; }
    public string Title { get; set; } = "";
    public string Skill { get; set; } = "";
    public decimal? OverallBand { get; set; }
    public decimal? AutoScore { get; set; }
    public decimal? AutoMaxScore { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class StudentNotificationsDto
{
    public int UnreadCount { get; set; }
    public List<StudentNotificationItemDto> Items { get; set; } = new();
}

public class StudentNotificationItemDto
{
    public int Id { get; set; }
    public string Type { get; set; } = "General";
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string Content { get; set; } = "";
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
