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

    // Số tiền thu đợt này; bỏ trống = thu đủ số còn nợ
    [Range(1, 1000000000, ErrorMessage = "Số tiền không hợp lệ")]
    public decimal? Amount { get; set; }

    [StringLength(100, ErrorMessage = "Mã giao dịch tối đa 100 ký tự")]
    public string? TransferRef { get; set; }

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

public class PaymentDecisionRequest
{
    // Ngày nhận tiền (khi xác nhận); bỏ trống = ngày học viên báo
    public DateOnly? PaidDate { get; set; }

    // Lý do (bắt buộc khi từ chối / hủy)
    [StringLength(300, ErrorMessage = "Lý do tối đa 300 ký tự")]
    public string? Reason { get; set; }
}

public class RefundRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Mã ghi danh không hợp lệ")]
    public int EnrollmentId { get; set; }

    [Range(1, 1000000000, ErrorMessage = "Số tiền không hợp lệ")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Hình thức là bắt buộc")]
    [RegularExpression("^(Cash|Transfer)$", ErrorMessage = "Hình thức phải là Cash hoặc Transfer")]
    public string Method { get; set; } = "Cash";

    [Required(ErrorMessage = "Cần nhập lý do hoàn tiền")]
    [StringLength(300, MinimumLength = 3, ErrorMessage = "Lý do 3-300 ký tự")]
    public string Reason { get; set; } = "";
}
