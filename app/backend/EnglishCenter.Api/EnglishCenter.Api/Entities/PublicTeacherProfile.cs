namespace EnglishCenter.Api.Entities;

public class PublicTeacherProfile
{
    public int Id { get; set; }
    public string Slug { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Title { get; set; } = "";
    public string Bio { get; set; } = "";
    public string CredentialsJson { get; set; } = "[]";
    public string? AvatarUrl { get; set; }
    public bool IsPublished { get; set; }
}
