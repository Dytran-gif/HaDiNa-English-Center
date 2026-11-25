namespace EnglishCenter.Api.Entities;

public class ConsultationRequest
{
    public int Id { get; set; }
    public Guid SubmissionId { get; set; }
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string CourseSlug { get; set; } = "";
    public string CourseName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
