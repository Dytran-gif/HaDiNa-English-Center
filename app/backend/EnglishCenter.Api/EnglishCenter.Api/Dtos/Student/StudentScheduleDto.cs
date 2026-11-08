namespace EnglishCenter.Api.Dtos.StudentPortal;

// Response GET api/student/schedule - thời khóa biểu tuần của học viên.
// Khớp với FE: services/student/useStudentApi.ts.
public class StudentScheduleResponseDto
{
    public string WeekStart { get; set; } = "";
    public string WeekEnd { get; set; } = "";
    public List<StudentScheduleDayDto> Days { get; set; } = new();
    public List<StudentScheduleSessionDto> Sessions { get; set; } = new();

    // ⚠️ DB chưa có bảng thông báo (AppNotification) -> luôn rỗng.
    // KHI CÓ BẢNG: lọc thông báo của các lớp học viên đang học rồi gán vào đây.
    public List<StudentScheduleNoticeDto> Notices { get; set; } = new();
}

public class StudentScheduleDayDto
{
    public string Key { get; set; } = "";     // "Mon".."Sun"
    public string Label { get; set; } = "";
    public string DateStr { get; set; } = ""; // "yyyy-MM-dd"
}

// Một buổi học trong tuần (tính ra từ ClassSchedules, không lưu bảng riêng)
public class StudentScheduleSessionDto
{
    public string ClassId { get; set; } = "";
    public string ClassName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string BandFrom { get; set; } = "";
    public string BandTo { get; set; } = "";
    public string Description { get; set; } = "";
    public int TotalSessions { get; set; }
    public string TeacherName { get; set; } = "";
    public string RoomName { get; set; } = "";
    public string DayOfWeek { get; set; } = ""; // "Mon".."Sun"
    public string DateStr { get; set; } = "";
    public string StartTime { get; set; } = ""; // "HH:mm"
    public string EndTime { get; set; } = "";
    public int SessionNo { get; set; }          // buổi thứ mấy của khóa
    public bool IsCancelled { get; set; }
    public string? CancelReason { get; set; }
}

public class StudentScheduleNoticeDto
{
    public string Title { get; set; } = "";
    public string DateStr { get; set; } = "";
    public string Message { get; set; } = "";
}

// Một mục lịch sử khóa học (ghi danh không còn Active: OnHold/Dropped)
public class StudentScheduleHistoryItemDto
{
    public int EnrollmentId { get; set; }
    public string Status { get; set; } = "";
    public string RegisteredAt { get; set; } = "";
    public string ClassId { get; set; } = "";
    public string ClassName { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string Band { get; set; } = "";
    public int TotalSessions { get; set; }
    public string TeacherName { get; set; } = "";
}
