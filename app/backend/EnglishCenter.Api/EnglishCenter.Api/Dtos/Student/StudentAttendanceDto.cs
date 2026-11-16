namespace EnglishCenter.Api.Dtos.StudentPortal;

public class StudentAttendanceItemDto
{
    public int Id { get; set; }
    public int SessionNumber { get; set; }   // số buổi theo thứ tự ngày (1 = buổi sớm nhất)
    public DateOnly Date { get; set; }
    public string Status { get; set; } = "";  // Present | Late | Absent | Excused
    public string? Note { get; set; }
}

public class StudentAttendanceSummaryDto
{
    public int Present { get; set; }
    public int Late { get; set; }
    public int Absent { get; set; }
    public int Excused { get; set; }
}

public class StudentAttendancePageDto
{
    public List<StudentAttendanceItemDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public StudentAttendanceSummaryDto Summary { get; set; } = new();
}