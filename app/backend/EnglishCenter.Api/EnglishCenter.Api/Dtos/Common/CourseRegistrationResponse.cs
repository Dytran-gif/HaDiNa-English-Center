using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.Common;

public class CourseRegistrationResponse
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentCode { get; set; } = "";
    public string StudentName { get; set; } = "";
    public int CourseId { get; set; }
    public string CourseName { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public int? ClassId { get; set; }
    public string? ClassName { get; set; }
    public DateTime? AssignedAt { get; set; }
}

public class RegisterCourseRequest
{
    [Range(1, int.MaxValue)] public int CourseId { get; set; }
}

public class AssignCourseClassRequest
{
    [Range(1, int.MaxValue)] public int ClassId { get; set; }
}
