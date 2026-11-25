namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một dòng học phí của học viên (theo docs/api/STUDENT_API.md §6).
// Khớp với FE: services/student/useStudentApi.ts (StudentTuitionItem).
public class StudentTuitionItemDto
{
    public int EnrollmentId { get; set; }
    public int ClassId { get; set; }
    public string ClassCode { get; set; } = "";
    public string EnrollmentStatus { get; set; } = "";
    public decimal ExtraDiscountAmount { get; set; }
    public string? DiscountNote { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string PaymentStatus { get; set; } = "";      // Unpaid | Partial | Paid | Refunded
    public List<StudentPaymentDto> Payments { get; set; } = new();
    public string ClassName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string BandFrom { get; set; } = "";
    public string BandTo { get; set; } = "";
    public int TotalSessions { get; set; }
    public decimal TuitionFee { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalTuitionFee { get; set; }
    public int? PaymentId { get; set; }
    public decimal? PaidAmount { get; set; }
    public DateOnly? PaidDate { get; set; }
    public string? Method { get; set; }
    public string? Note { get; set; }
    public bool IsPaid { get; set; }
}

public class StudentPaymentDto
{
    public int Id { get; set; }
    public string? ReceiptNo { get; set; }
    public string Kind { get; set; } = "";               // Payment | Refund
    public string Status { get; set; } = "";             // Pending | Confirmed | Rejected | Cancelled
    public decimal Amount { get; set; }
    public string Method { get; set; } = "";
    public DateOnly PaidDate { get; set; }
    public string? TransferRef { get; set; }
    public string? CancelReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Học viên báo đã chuyển khoản -> yêu cầu chờ trung tâm xác nhận
public class TransferRequestDto
{
    [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue, ErrorMessage = "Hãy chọn khoản học phí")]
    public int EnrollmentId { get; set; }

    [System.ComponentModel.DataAnnotations.Range(1000, 1000000000, ErrorMessage = "Số tiền không hợp lệ")]
    public decimal Amount { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(100, ErrorMessage = "Mã giao dịch tối đa 100 ký tự")]
    public string? TransferRef { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(300)]
    public string? Note { get; set; }
}

// Thông tin chuyển khoản của trung tâm (appsettings: Payment:Bank)
public class BankInfoDto
{
    public string BankName { get; set; } = "";
    public string AccountNumber { get; set; } = "";
    public string AccountName { get; set; } = "";
    public string? Branch { get; set; }
}
