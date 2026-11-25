using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos;

public class ConsultationInput : IValidatableObject
{
    public Guid SubmissionId { get; set; }
    [Required, StringLength(150)] public string FullName { get; set; } = "";
    [Required, StringLength(30), RegularExpression(@"^\+?[0-9 ()\-\.]{8,30}$")]
    public string Phone { get; set; } = "";
    [Required, EmailAddress, StringLength(255)] public string Email { get; set; } = "";
    [Required, StringLength(150), RegularExpression(@"^[a-z0-9-]+$")]
    public string CourseSlug { get; set; } = "";
    [Required, StringLength(200)] public string CourseName { get; set; } = "";
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (SubmissionId == Guid.Empty) yield return new ValidationResult("Mã gửi không hợp lệ.", [nameof(SubmissionId)]);
        var digits = (Phone ?? "").Count(char.IsAsciiDigit);
        if (digits < 8 || digits > 15) yield return new ValidationResult("Số điện thoại cần có 8–15 chữ số.", [nameof(Phone)]);
    }
}
