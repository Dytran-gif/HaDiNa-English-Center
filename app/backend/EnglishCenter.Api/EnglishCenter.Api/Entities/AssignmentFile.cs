namespace EnglishCenter.Api.Entities;

// Bảng Assignments (học viên đã tạo sẵn trong DB) — MỘT bảng chứa cả 2 loại:
// - FileType = "Teacher": bài tập GV giao. StudentId = NULL.
// - FileType = "Student": bài nộp của HV. StudentId = id học viên nộp.
// (CHECK constraint trong DB: [FileType] IN ('Student','Teacher'))
// TeacherId luôn là GV liên quan; mối liên hệ khóa học suy ra từ TeacherId (GV dạy lớp thuộc khóa).
// Lưu ý: entity Teacher.Assignment (module Teacher) cũng map tới bảng "Assignments" nên entity này
// được map dạng view (chỉ đọc) trong AppDbContext, còn ghi dữ liệu bằng SQL thô trong controller.
public class AssignmentFile
{
    public int Id { get; set; }
    public int TeacherId { get; set; }
    public int? StudentId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string FileName { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string FileType { get; set; } = "Teacher";
    public DateTime CreatedAt { get; set; }
}
