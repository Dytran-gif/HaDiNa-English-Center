namespace EnglishCenter.Api.Entities;

// Bảng Assignments (học viên đã tạo sẵn trong DB) — MỘT bảng chứa cả 2 loại:
// - FileType = "Teacher": bài tập GV giao. StudentId = NULL.
// - FileType = "Student": bài nộp của HV. StudentId = id học viên nộp.
// (CHECK constraint trong DB: [FileType] IN ('Student','Teacher'))
// TeacherId luôn là GV liên quan; mối liên hệ khóa học suy ra từ TeacherId (GV dạy lớp thuộc khóa).
// Ghi dữ liệu vẫn bằng SQL thô trong controller (giữ nguyên code module Student).
public class AssignmentFile
{
    public int Id { get; set; }
    public int TeacherId { get; set; }
    public int? StudentId { get; set; }
    public int? CourseId { get; set; }
    // Với bài nộp (FileType=Student): Id của bài tập gốc (FileType=Teacher) mà học viên nộp vào.
    // NULL với chính bài tập của GV. Dùng để khớp đúng bài nộp - bài tập (không lẫn khi trùng tiêu đề).
    public int? AssignmentId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string FileName { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string FileType { get; set; } = "Teacher";
    public DateTime CreatedAt { get; set; }
}
