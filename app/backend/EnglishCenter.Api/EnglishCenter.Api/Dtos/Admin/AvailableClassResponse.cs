namespace EnglishCenter.Api.Dtos.Admin;

public class AvailableClassResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int CourseId { get; set; }
    public string CourseName { get; set; } = "";
    public int Enrolled { get; set; }
    public int Capacity { get; set; }
    public decimal Tuition { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal FinalTuition { get; set; }
}
