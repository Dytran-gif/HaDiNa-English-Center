namespace EnglishCenter.Api.Entities;

// Điểm danh: 1 dòng = 1 học viên ở 1 lớp trong 1 ngày học.
// Không có bảng buổi học riêng: ngày học tính từ lịch tuần ClassSchedules trong khoảng StartDate–EndDate của lớp
// (giống trang Lịch dạy / Lịch học). Lớp có 2 ca trong cùng 1 ngày thì vẫn chỉ điểm danh 1 lần cho ngày đó.
public class Attendance
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public int StudentId { get; set; }
    public DateOnly Date { get; set; }
    public string Status { get; set; } = "Present";   // Present | Late | Absent | Excused
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public CourseClass Class { get; set; } = null!;
    public Student Student { get; set; } = null!;
}
