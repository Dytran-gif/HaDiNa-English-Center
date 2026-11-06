using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.StudentPortal;

// Response GET api/student/profile (theo docs/api/STUDENT_API.md §2)
public class StudentProfileResponse
{
    public string Code { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string? ParentName { get; set; }
    public string? ParentPhone { get; set; }
    public decimal? TargetBand { get; set; }
}

public class StudentChangePasswordRequest
{
    [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc")]
    public string CurrentPassword { get; set; } = "";

    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
    [MinLength(8, ErrorMessage = "Mật khẩu mới tối thiểu 8 ký tự")]
    public string NewPassword { get; set; } = "";

    [Compare(nameof(NewPassword), ErrorMessage = "Nhập lại mật khẩu không khớp")]
    public string ConfirmPassword { get; set; } = "";
}
