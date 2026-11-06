namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một lớp học của học viên để gửi phản hồi (trang Feedback)
public class StudentFeedbackClassDto
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public string CourseId { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string Description { get; set; } = "";
    public string BandFrom { get; set; } = "";
    public string BandTo { get; set; } = "";
    public int TotalSessions { get; set; }
    public int SessionsPerWeek { get; set; }
    public decimal Tuition { get; set; }
    public int TeacherId { get; set; }
    public string TeacherName { get; set; } = "";
}

// Một phản hồi của lớp (ai gửi + nội dung + thời điểm)
public class StudentFeedbackItemDto
{
    public int Id { get; set; }
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public string StudentName { get; set; } = "";
}

public class FeedbackCreateRequest
{
    public int ClassId { get; set; }
    public string Content { get; set; } = "";
}
