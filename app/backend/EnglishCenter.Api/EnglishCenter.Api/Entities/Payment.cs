namespace EnglishCenter.Api.Entities;

// Một dòng tiền của một ghi danh. Một ghi danh có thể có nhiều dòng (đóng nhiều đợt, hoàn tiền).
// Doanh thu chỉ tính dòng Status = Confirmed: Kind = Payment cộng vào, Kind = Refund trừ ra.
// Học viên chỉ tạo được dòng Pending (báo đã chuyển khoản); Admin xác nhận / từ chối / hủy.
public class Payment
{
    public int Id { get; set; }
    public int EnrollmentId { get; set; }
    public int CreatedByUserId { get; set; }            // người tạo: Admin lập phiếu hoặc học viên gửi yêu cầu
    public string? ReceiptNo { get; set; }              // số biên lai PT-YYMM-0001 (cấp khi Confirmed)
    public string Kind { get; set; } = "Payment";       // Payment | Refund
    public string Status { get; set; } = "Confirmed";   // Pending | Confirmed | Rejected | Cancelled
    public decimal Amount { get; set; }                 // luôn > 0, Refund cũng ghi số dương
    public string Method { get; set; } = "Cash";        // Cash | Transfer
    public string? TransferRef { get; set; }            // mã giao dịch / nội dung chuyển khoản
    public DateOnly PaidDate { get; set; }
    public string? Note { get; set; }
    public int? ConfirmedByUserId { get; set; }
    public DateTime? ConfirmedAt { get; set; }          // ngày ghi nhận doanh thu
    public string? CancelReason { get; set; }           // lý do từ chối / hủy phiếu
    public DateTime CreatedAt { get; set; }

    public Enrollment Enrollment { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
    public User? ConfirmedByUser { get; set; }
}
