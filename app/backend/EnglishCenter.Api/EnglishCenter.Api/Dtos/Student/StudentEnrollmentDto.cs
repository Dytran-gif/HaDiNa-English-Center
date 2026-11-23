namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một ghi danh của học viên kèm thông tin khóa học.
// Khớp với FE: services/student/useStudentApi.ts (StudentEnrollmentItem).
public class StudentEnrollmentItemDto
{
    public int EnrollmentId { get; set; }
    public string Status { get; set; } = "";
    public CourseItemDto Course { get; set; } = new();

    // Học phí chốt tại thời điểm ghi danh (snapshot) — FE hiển thị đúng số tiền cần thanh toán
    public decimal TuitionFee { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalTuitionFee { get; set; }

    // Thông tin thanh toán (null khi chưa thanh toán) - để FE hiển thị trạng thái đã đóng học phí
    public bool IsPaid { get; set; }
    public decimal? PaidAmount { get; set; }
    public DateOnly? PaidDate { get; set; }
    public string? Method { get; set; }
}
