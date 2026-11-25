namespace EnglishCenter.Api.Entities;

public class PublicTeacherProfile
{
    public int Id { get; set; }
    // Hồ sơ public gắn với giáo viên thật (bảng Teachers). NULL = hồ sơ giới thiệu cũ chưa gắn tài khoản.
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public string Slug { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Title { get; set; } = "";
    public string Bio { get; set; } = "";
    public string CredentialsJson { get; set; } = "[]";
    public string? AvatarUrl { get; set; }
    public bool IsPublished { get; set; }
}
