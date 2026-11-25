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
    public string ClassCode { get; set; } = "";
    public string? MeetingUrl { get; set; }
    public string? AttendanceStatus { get; set; }   // Present | Late | Absent | Excused | null (chưa điểm danh)
    public string? AttendanceNote { get; set; }
    public int NewAssignments { get; set; }         // bài tập của lớp giao trong 7 ngày trước buổi
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
    public int SessionNo { get; set; }          // buổi thứ mấy của lớp
    public bool IsCancelled { get; set; }
    public string? CancelReason { get; set; }
}

public class StudentScheduleNoticeDto
{
    public string Title { get; set; } = "";
    public string DateStr { get; set; } = "";
    public string Message { get; set; } = "";
}

// Một mục lịch sử khóa học: lớp đã học xong (EndDate đã qua) hoặc ghi danh không còn Active (OnHold/Dropped)
public class StudentScheduleHistoryItemDto
{
    public int EnrollmentId { get; set; }
    public string Status { get; set; } = "";            // trạng thái ghi danh
    public string ClassStatus { get; set; } = "";       // Finished | Ongoing | Upcoming
    public string ClassCode { get; set; } = "";
    public int Year { get; set; }                       // năm kết thúc lớp (nhóm thư mục)
    public int AttendedSessions { get; set; }           // có mặt + muộn
    public int MarkedSessions { get; set; }             // số buổi đã điểm danh
    public int AssignmentCount { get; set; }
    public int SubmittedCount { get; set; }
    public int FeedbackCount { get; set; }
    public string? LastFeedbackAt { get; set; }
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
