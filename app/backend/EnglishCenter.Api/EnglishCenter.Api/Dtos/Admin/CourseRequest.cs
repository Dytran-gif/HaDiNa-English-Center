using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.Admin;

public class CourseRequest : IValidatableObject
{
    [Required(ErrorMessage = "Tên khóa học là bắt buộc")]
    [StringLength(150)]
    public string Name { get; set; } = "";

    public string? Description { get; set; }

    // Mã khóa ngắn ghép vào mã lớp (vd IE65). Bỏ trống thì tự sinh từ tên.
    [StringLength(10, ErrorMessage = "Mã khóa tối đa 10 ký tự")]
    public string? Code { get; set; }

    // Đường dẫn trang public /khoa-hoc/{slug}. Bỏ trống thì tự sinh từ tên.
    [StringLength(150)]
    public string? Slug { get; set; }

    private string? _imageUrl;
    [StringLength(500)]
    public string? ImageUrl
    {
        get => _imageUrl;
        set { _imageUrl = value; ImageUrlProvided = true; }
    }
    [System.Text.Json.Serialization.JsonIgnore]
    public bool ImageUrlProvided { get; private set; }

    // Omitted: visible for a new course; preserve the current value when updating.
    public bool? IsPublished { get; set; }

    [System.Text.Json.Serialization.JsonRequired]
    [Range(typeof(decimal), "0", "9", ErrorMessage = "Band từ phải trong khoảng 0.0-9.0")]
    public decimal BandFrom { get; set; }

    [System.Text.Json.Serialization.JsonRequired]
    [Range(typeof(decimal), "0", "9", ErrorMessage = "Band đến phải trong khoảng 0.0-9.0")]
    public decimal BandTo { get; set; }

    [Range(1, 1000, ErrorMessage = "Tổng số buổi phải lớn hơn 0")]
    public int TotalSessions { get; set; }

    [Range(1, 7, ErrorMessage = "Số buổi mỗi tuần từ 1 đến 7")]
    public int SessionsPerWeek { get; set; }

    [System.Text.Json.Serialization.JsonRequired]
    [Range(typeof(decimal), "0", "1000000000", ErrorMessage = "Học phí không hợp lệ")]
    public decimal Tuition { get; set; }

    [Range(typeof(decimal), "0", "50", ErrorMessage = "Giảm giá phải trong khoảng 0-50%")]
    public decimal DiscountPercent { get; set; }

    // Các luật cần so sánh giữa nhiều trường
    public IEnumerable<ValidationResult> Validate(ValidationContext ctx)
    {
        if (BandFrom >= BandTo)
            yield return new ValidationResult("Band từ phải nhỏ hơn band đến", new[] { nameof(BandFrom), nameof(BandTo) });

        if (BandFrom % 0.5m != 0 || BandTo % 0.5m != 0)
            yield return new ValidationResult("Band tăng theo bước 0.5", new[] { nameof(BandFrom), nameof(BandTo) });

        if (SessionsPerWeek > TotalSessions)
            yield return new ValidationResult("Số buổi mỗi tuần không được lớn hơn tổng số buổi", new[] { nameof(SessionsPerWeek) });
    }
}
