namespace EnglishCenter.Api.Dtos.Admin;

public class StudentEnrollmentItem
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public string ClassCode { get; set; } = "";
    public string ClassName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public DateOnly ClassStartDate { get; set; }
    public DateOnly ClassEndDate { get; set; }
    public string ClassStatus { get; set; } = "";   // Upcoming | Ongoing | Finished

    public decimal TuitionFee { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal ExtraDiscountAmount { get; set; }
    public string? DiscountNote { get; set; }
    public decimal FinalTuitionFee { get; set; }
    public string Status { get; set; } = "";        // Active | OnHold | Dropped

    // Tiền: đã thu (đã xác nhận) - đã hoàn, đang chờ xác nhận, còn nợ
    public decimal PaidAmount { get; set; }
    public decimal RefundedAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string PaymentStatus { get; set; } = "";  // Unpaid | Partial | Paid | Refunded

    // Phiếu thu gần nhất đã xác nhận (null nếu chưa đóng tiền)
    public int? PaymentId { get; set; }
    public DateOnly? PaidDate { get; set; }
    public string? PaymentMethod { get; set; }
}