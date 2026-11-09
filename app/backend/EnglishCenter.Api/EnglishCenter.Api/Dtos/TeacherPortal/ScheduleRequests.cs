using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.TeacherPortal;

// Khai báo khung giờ rảnh cho học viên đặt lịch 1 kèm 1
public class AvailabilityCreate : IValidatableObject
{
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }

    // Lặp lại hằng tuần trong N tuần (1 = chỉ ngày này)
    [Range(1, 12, ErrorMessage = "Số tuần lặp từ 1 đến 12")]
    public int RepeatWeeks { get; set; } = 1;

    public IEnumerable<ValidationResult> Validate(ValidationContext ctx)
    {
        if (StartTime >= EndTime)
            yield return new ValidationResult("Giờ bắt đầu phải trước giờ kết thúc");
        if ((EndTime - StartTime).TotalMinutes < 30)
            yield return new ValidationResult("Khung giờ rảnh tối thiểu 30 phút");
    }
}
