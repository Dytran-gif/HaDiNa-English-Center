namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một dòng học phí của học viên (theo docs/api/STUDENT_API.md §6).
// Khớp với FE: services/student/useStudentApi.ts (StudentTuitionItem).
public class StudentTuitionItemDto
{
    public int EnrollmentId { get; set; }
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

public class TuitionPayRequest
{
    public List<int> EnrollmentIds { get; set; } = new();
}
