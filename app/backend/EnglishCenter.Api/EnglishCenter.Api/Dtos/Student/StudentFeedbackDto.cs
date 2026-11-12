namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một lớp học của học viên để xem nhận xét (trang Feedback)
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

// Một nhận xét giáo viên viết cho học viên (trang Feedback)
public class StudentFeedbackItemDto
{
    public int Id { get; set; }
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public string TeacherName { get; set; } = "";
}
