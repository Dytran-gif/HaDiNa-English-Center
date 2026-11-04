namespace EnglishCenter.Api.Dtos.StudentPortal;

// Một ghi danh của học viên kèm thông tin khóa học.
// Khớp với FE: services/student/useStudentApi.ts (StudentEnrollmentItem).
public class StudentEnrollmentItemDto
{
    public int EnrollmentId { get; set; }
    public string Status { get; set; } = "";
    public CourseItemDto Course { get; set; } = new();
}
