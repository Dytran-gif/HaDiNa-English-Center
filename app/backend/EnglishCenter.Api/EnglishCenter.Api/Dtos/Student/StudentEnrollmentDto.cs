namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một ghi danh của học viên kèm thông tin khóa học.
// Khớp với FE: services/student/useStudentApi.ts (StudentEnrollmentItem).
public class StudentEnrollmentItemDto
{
    public int EnrollmentId { get; set; }
    public string Status { get; set; } = "";
    public CourseItemDto Course { get; set; } = new();

    // Thông tin thanh toán (null khi chưa thanh toán) - để FE hiển thị trạng thái đã đóng học phí
    public bool IsPaid { get; set; }
    public decimal? PaidAmount { get; set; }
    public DateOnly? PaidDate { get; set; }
    public string? Method { get; set; }
}
