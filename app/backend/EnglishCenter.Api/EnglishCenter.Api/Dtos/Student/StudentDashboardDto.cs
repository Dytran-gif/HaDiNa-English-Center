namespace EnglishCenter.Api.Dtos.StudentPortal;

// Response GET api/student/dashboard.
// Shape khớp với FE: types/StudentTypes/MainTypes/GeneralTypes.ts
// (chỉ dùng các bảng có sẵn trong DB: Students, Users, Enrollments, Classes, Courses).
public class StudentDashboardDto
{
    public StudentInfoDto Student { get; set; } = new();
    public NextLessonInfoDto? NextLesson { get; set; }
    public List<CourseItemDto> Courses { get; set; } = new();

    // ⚠️ DB chưa có bảng thông báo (xem type AppNotification trong GeneralTypes.ts) -> luôn rỗng.
    // KHI CÓ BẢNG: truy vấn thông báo rồi gán vào đây trong DashboardController.
    public List<NotificationItemDto> Notifications { get; set; } = new();
}

public class StudentInfoDto
{
    public string Id { get; set; } = "";
    public string Code { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? AvatarUrl { get; set; }
}

// Khối "Your next lesson" (PresentLesson) - lấy từ khóa đang học đầu tiên
public class NextLessonInfoDto
{
    public string CourseName { get; set; } = "";
    public string BandFrom { get; set; } = "";
    public string BandTo { get; set; } = "";
    public string Description { get; set; } = "";
    public int TotalSessions { get; set; }
    public string? ImageUrl { get; set; }
}

// Khớp type Course trong GeneralTypes.ts
public class CourseItemDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string BandFrom { get; set; } = "";
    public string BandTo { get; set; } = "";
    public int TotalSessions { get; set; }
    public int SessionsPerWeek { get; set; }
    public decimal Tuition { get; set; }
    public decimal DiscountPercent { get; set; }
    public string? ImageUrl { get; set; }
}

// Khớp type AppNotification trong GeneralTypes.ts (rút gọn phần Dashboard cần)
public class NotificationItemDto
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
}
