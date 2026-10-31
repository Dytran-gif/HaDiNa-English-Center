using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.Admin;

public class ChangePasswordRequest : IValidatableObject
{
    [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc")]
    public string CurrentPassword { get; set; } = "";

    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
    [MinLength(8, ErrorMessage = "Mật khẩu mới tối thiểu 8 ký tự")]
    public string NewPassword { get; set; } = "";

    [Compare(nameof(NewPassword), ErrorMessage = "Nhập lại mật khẩu không khớp")]
    public string ConfirmPassword { get; set; } = "";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (CurrentPassword == NewPassword)
            yield return new ValidationResult("Mật khẩu mới phải khác mật khẩu hiện tại", new[] { nameof(NewPassword) });
    }
}
