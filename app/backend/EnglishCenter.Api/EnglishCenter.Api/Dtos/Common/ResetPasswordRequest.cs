using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.Common;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
    [MinLength(8, ErrorMessage = "Mật khẩu tối thiểu 8 ký tự")]
    public string NewPassword { get; set; } = "";
}