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

    public decimal ExtraDiscountAmount { get; set; }
    public string? DiscountNote { get; set; }

    // Lớp + trạng thái tính theo ngày của lớp (Đang học / Sắp học / Đã học)
    public int ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public string ClassStatus { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string TeacherName { get; set; } = "";
    public string ScheduleText { get; set; } = "";       // "T2, T4, T6 · 18:00–19:30"
    public int SessionsDone { get; set; }
    public int ClassTotalSessions { get; set; }
    public bool CanCancel { get; set; }                  // lớp chưa khai giảng và chưa đóng tiền

    // Tiền: đã thu (đã xác nhận - hoàn), đang chờ xác nhận, còn nợ
    public bool IsPaid { get; set; }                     // đã đóng đủ
    public decimal? PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string PaymentStatus { get; set; } = "";      // Unpaid | Partial | Paid | Refunded
    public DateOnly? PaidDate { get; set; }
    public string? Method { get; set; }
}

// Một lớp của khóa khi học viên chọn lớp để đăng ký
public class StudentClassOptionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string TeacherName { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Status { get; set; } = "";            // Upcoming | Ongoing
    public List<StudentClassSlotDto> Schedules { get; set; } = new();
    public int Enrolled { get; set; }
    public int MaxStudents { get; set; }
    public int TotalSessions { get; set; }
    public int RemainingSessions { get; set; }
    public decimal FinalTuition { get; set; }
    public bool IsFull { get; set; }
    public string? Conflict { get; set; }                // mô tả lớp bị trùng lịch
    public string? AlreadyInCourse { get; set; }         // mã lớp cùng khóa đang học
    public bool CanEnroll { get; set; }
    public string? Reason { get; set; }                  // lý do không đăng ký được
}

public class StudentClassSlotDto
{
    public int DayOfWeek { get; set; }                   // 1 = Thứ 2 ... 7 = Chủ nhật
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    public string? RoomName { get; set; }
}

public class StudentEnrollRequest
{
    [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue, ErrorMessage = "Hãy chọn lớp")]
    public int ClassId { get; set; }
}
