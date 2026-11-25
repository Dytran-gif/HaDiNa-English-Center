namespace EnglishCenter.Api.Dtos.Admin;

public class PaymentResponse
{
    public int Id { get; set; }
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public string StudentCode { get; set; } = "";
    public string StudentName { get; set; } = "";
    public int ClassId { get; set; }
    public string ClassCode { get; set; } = "";
    public string ClassName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public decimal TuitionFee { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalTuitionFee { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaidDate { get; set; }
    public string Method { get; set; } = "";
    public string? ReceiptNo { get; set; }
    public string Kind { get; set; } = "";          // Payment | Refund
    public string Status { get; set; } = "";        // Pending | Confirmed | Rejected | Cancelled
    public string? TransferRef { get; set; }
    public string? Note { get; set; }
    public string? CancelReason { get; set; }
    public bool RequestedByStudent { get; set; }    // yêu cầu do học viên gửi (chuyển khoản)
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
}

// Công nợ của một ghi danh
public class ReceivableResponse
{
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public string StudentCode { get; set; } = "";
    public string StudentName { get; set; } = "";
    public string StudentPhone { get; set; } = "";
    public int ClassId { get; set; }
    public string ClassCode { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string EnrollmentStatus { get; set; } = "";
    public DateOnly ClassStartDate { get; set; }
    public decimal FinalTuitionFee { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RefundedAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string PaymentStatus { get; set; } = "";
}

public class PaymentSummaryResponse
{
    public decimal Receivable { get; set; }      // tổng phải thu (ghi danh chưa nghỉ)
    public decimal Collected { get; set; }       // đã thu thực (đã xác nhận - đã hoàn)
    public decimal Outstanding { get; set; }     // còn nợ
    public int PendingCount { get; set; }        // yêu cầu chờ xác nhận
    public decimal PendingAmount { get; set; }
    public int DebtorCount { get; set; }         // số ghi danh còn nợ
}

public class PaymentReceiptResponse
{
    public PaymentResponse Payment { get; set; } = new();
    public CenterSettingResponse Center { get; set; } = new();
    public int CreatedByUserId { get; set; }
    public string CreatedByName { get; set; } = "";
    public string CreatedByEmail { get; set; } = "";
    public string? Note { get; set; }
}

public class StudentPaymentsResponse
{
    public List<PaymentResponse> Items { get; set; } = new();
    public decimal TotalPaid { get; set; }
}
