namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một bài tập của GV trong popup chi tiết khóa (kèm bài nộp của chính học viên)
public class StudentAssignmentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string FileName { get; set; } = "";
    public bool HasFile { get; set; }
    public DateTime CreatedAt { get; set; }
    public StudentSubmissionInfoDto? MySubmission { get; set; }
}

public class StudentSubmissionInfoDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = "";
    public DateTime SubmittedAt { get; set; }
}
