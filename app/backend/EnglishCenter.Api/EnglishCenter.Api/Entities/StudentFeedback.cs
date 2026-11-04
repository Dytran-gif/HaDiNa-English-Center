namespace EnglishCenter.Api.Entities;

// Phản hồi của học viên về giáo viên / lớp học (trang Feedback của Student).
// Bảng StudentFeedbacks - tạo bằng script docs/admin/sql/2026-11-04-student-feedback-table.sql
public class StudentFeedback
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int ClassId { get; set; }
    public int TeacherId { get; set; }
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }

    public Student Student { get; set; } = null!;
    public CourseClass Class { get; set; } = null!;
    public Teacher Teacher { get; set; } = null!;
}
