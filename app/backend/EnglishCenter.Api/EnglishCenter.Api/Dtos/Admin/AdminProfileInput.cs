using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.Admin;

public class AdminProfileInput : IValidatableObject
{
    [Required, StringLength(150)] public string FullName { get; set; } = "";
    [StringLength(20), RegularExpression(@"^\+?[0-9 ()\-\.]{8,20}$")]
    public string? Phone { get; set; }
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (!string.IsNullOrWhiteSpace(Phone))
        {
            var count = Phone.Count(char.IsAsciiDigit);
            if (count < 8 || count > 15)
                yield return new ValidationResult("Số điện thoại cần có 8–15 chữ số.", [nameof(Phone)]);
        }
    }
}
