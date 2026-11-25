using System.ComponentModel.DataAnnotations;
using System.Text;

namespace EnglishCenter.Api.Dtos;

public class RegisterStudentInput : IValidatableObject
{
    [Required, StringLength(150)] public string FullName { get; set; } = "";
    [Required, EmailAddress, StringLength(255)] public string Email { get; set; } = "";
    [Required, StringLength(20), RegularExpression(@"^\+?[0-9 ()\-\.]{8,20}$")]
    public string Phone { get; set; } = "";
    [Required, StringLength(72, MinimumLength = 8)] public string Password { get; set; } = "";
    [Required, Compare(nameof(Password))] public string ConfirmPassword { get; set; } = "";

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Encoding.UTF8.GetByteCount(Password ?? "") > 72)
            yield return new ValidationResult("Mật khẩu tối đa 72 byte UTF-8.", [nameof(Password)]);
        var digits = (Phone ?? "").Count(char.IsAsciiDigit);
        if (digits < 8 || digits > 15)
            yield return new ValidationResult("Số điện thoại cần có 8–15 chữ số.", [nameof(Phone)]);
    }
}
