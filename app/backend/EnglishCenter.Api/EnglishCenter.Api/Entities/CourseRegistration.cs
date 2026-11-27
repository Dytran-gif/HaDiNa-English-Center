namespace EnglishCenter.Api.Entities;

public class CourseRegistration
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
    public int? ClassId { get; set; }
    public DateTime? AssignedAt { get; set; }
    public Student Student { get; set; } = null!;
    public Course Course { get; set; } = null!;
    public CourseClass? Class { get; set; }
}
