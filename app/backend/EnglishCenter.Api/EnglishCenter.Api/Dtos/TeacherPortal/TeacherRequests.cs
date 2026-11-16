using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.TeacherPortal;

public class TeacherChangePasswordRequest
{
    [Required(ErrorMessage = "Nhập mật khẩu hiện tại")]
    public string CurrentPassword { get; set; } = "";

    [Required(ErrorMessage = "Nhập mật khẩu mới")]
    [MinLength(8, ErrorMessage = "Mật khẩu mới tối thiểu 8 ký tự")]
    public string NewPassword { get; set; } = "";
}

public class FeedbackCreateRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Chọn học viên")]
    public int StudentId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Chọn lớp")]
    public int ClassId { get; set; }

    [Required(ErrorMessage = "Nhập nội dung nhận xét")]
    [MaxLength(1000, ErrorMessage = "Nhận xét tối đa 1000 ký tự")]
    public string Content { get; set; } = "";
}
