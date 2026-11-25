namespace EnglishCenter.Api.Entities;

public class Course
{
    public int Id { get; set; }
    public string Code { get; set; } = "";              // mã khóa ngắn, ghép vào mã lớp (vd IE65)
    public string Slug { get; set; } = "";              // đường dẫn trang public /khoa-hoc/{slug}
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal BandFrom { get; set; }
    public decimal BandTo { get; set; }
    public int TotalSessions { get; set; }
    public int SessionsPerWeek { get; set; }
    public decimal Tuition { get; set; }
    public decimal DiscountPercent { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsPublished { get; set; } = true;       // hiện trên website public
    public DateTime CreatedAt { get; set; }

    public List<CourseClass> Classes { get; set; } = new();
}