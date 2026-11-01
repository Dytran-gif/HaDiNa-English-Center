using System.ComponentModel.DataAnnotations;
using EnglishCenter.Api.Services;

namespace EnglishCenter.Api.Dtos.Admin;

public class PaymentRequest : IValidatableObject
{
    [Range(1, int.MaxValue, ErrorMessage = "Mã ghi danh không hợp lệ")]
    public int? EnrollmentId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Mã học viên không hợp lệ")]
    public int? StudentId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Mã lớp không hợp lệ")]
    public int? ClassId { get; set; }

    [Required(ErrorMessage = "Hình thức thu là bắt buộc")]
    [RegularExpression("^(Cash|Transfer)$", ErrorMessage = "Hình thức phải là Cash hoặc Transfer")]
    public string Method { get; set; } = "";

    public DateOnly? PaidDate { get; set; }

    [StringLength(500, ErrorMessage = "Ghi chú tối đa 500 ký tự")]
    public string? Note { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (EnrollmentId.HasValue)
        {
            if (StudentId.HasValue || ClassId.HasValue)
                yield return new ValidationResult("Chỉ gửi enrollmentId hoặc cặp studentId/classId",
                    new[] { nameof(EnrollmentId), nameof(StudentId), nameof(ClassId) });
        }
        else if (!StudentId.HasValue || !ClassId.HasValue)
        {
            yield return new ValidationResult("Hãy chọn ghi danh hoặc cả học viên và lớp",
                new[] { nameof(EnrollmentId), nameof(StudentId), nameof(ClassId) });
        }

        if (PaidDate.HasValue && PaidDate.Value > AppTime.Today)
            yield return new ValidationResult("Ngày thu không được ở tương lai", new[] { nameof(PaidDate) });
    }
}
