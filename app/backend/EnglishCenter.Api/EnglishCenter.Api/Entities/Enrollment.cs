namespace EnglishCenter.Api.Entities;

public class Enrollment
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int ClassId { get; set; }
    public decimal TuitionFee { get; set; }            // học phí gốc (snapshot)
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }          // tổng giảm = giảm % theo khóa + ExtraDiscountAmount
    public decimal ExtraDiscountAmount { get; set; }     // ưu đãi riêng Admin nhập khi ghi danh
    public string? DiscountNote { get; set; }            // lý do ưu đãi riêng / ghi chú tính theo buổi còn lại
    public decimal FinalTuitionFee { get; set; }
    public string Status { get; set; } = "Active";     // Active | OnHold | Dropped
    public DateTime CreatedAt { get; set; }

    public Student Student { get; set; } = null!;
    public CourseClass Class { get; set; } = null!;
    public List<Payment> Payments { get; set; } = new();  // nhiều phiếu: thu nhiều đợt, hoàn tiền
}