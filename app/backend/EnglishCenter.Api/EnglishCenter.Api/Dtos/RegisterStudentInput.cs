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

    // Thông tin thêm (không bắt buộc) — bảng Students đã có cột, trước đây form chưa hỏi
    public DateOnly? DateOfBirth { get; set; }
    [StringLength(150)] public string? ParentName { get; set; }
    [StringLength(20)] public string? ParentPhone { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Encoding.UTF8.GetByteCount(Password ?? "") > 72)
            yield return new ValidationResult("Mật khẩu tối đa 72 byte UTF-8.", [nameof(Password)]);
        if (DateOfBirth is { } dob)
        {
            var today = EnglishCenter.Api.Services.AppTime.Today;
            if (dob > today.AddYears(-4) || dob < today.AddYears(-100))
                yield return new ValidationResult("Ngày sinh không hợp lệ.", [nameof(DateOfBirth)]);
        }
        if (!string.IsNullOrWhiteSpace(ParentPhone))
        {
            var parentDigits = ParentPhone.Count(char.IsAsciiDigit);
            if (parentDigits < 8 || parentDigits > 15)
                yield return new ValidationResult("Số điện thoại phụ huynh cần có 8–15 chữ số.", [nameof(ParentPhone)]);
        }
        var digits = (Phone ?? "").Count(char.IsAsciiDigit);
        if (digits < 8 || digits > 15)
            yield return new ValidationResult("Số điện thoại cần có 8–15 chữ số.", [nameof(Phone)]);
    }
}
