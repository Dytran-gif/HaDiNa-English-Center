namespace EnglishCenter.Api.Dtos.StudentPortal;

// Chi tiết khóa học cho popup Present Lessons: thông tin khóa + GV + lớp + lịch học.
public class StudentCourseDetailDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string BandFrom { get; set; } = "";
    public string BandTo { get; set; } = "";
    public int TotalSessions { get; set; }
    public int SessionsPerWeek { get; set; }
    public decimal Tuition { get; set; }
    public decimal DiscountPercent { get; set; }
    public List<StudentCourseTeacherDto> Teachers { get; set; } = new();
    public List<StudentCourseClassDto> Classes { get; set; } = new();
}

public class StudentCourseTeacherDto
{
    public string FullName { get; set; } = "";
    public string? Specialty { get; set; }
    public string? Degree { get; set; }
}

public class StudentCourseClassDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int MaxStudents { get; set; }
    public string TeacherName { get; set; } = "";
    public List<StudentCourseScheduleDto> Schedules { get; set; } = new();
}

public class StudentCourseScheduleDto
{
    public string DayOfWeek { get; set; } = "";
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    public string? RoomName { get; set; }
}
