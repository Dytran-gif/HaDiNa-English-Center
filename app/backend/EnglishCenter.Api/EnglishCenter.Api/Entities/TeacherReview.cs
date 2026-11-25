namespace EnglishCenter.Api.Entities;

// Học viên đánh giá giáo viên của một lớp mình đã/đang học. Mỗi học viên 1 đánh giá / lớp.
// Admin duyệt (IsPublished) rồi mới hiện ở trang public, kèm tên viết tắt của học viên.
public class TeacherReview
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int ClassId { get; set; }
    public int TeacherId { get; set; }
    public int Rating { get; set; }                     // 1..5
    public string Comment { get; set; } = "";
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }

    public Student Student { get; set; } = null!;
    public CourseClass Class { get; set; } = null!;
    public Teacher Teacher { get; set; } = null!;
}
