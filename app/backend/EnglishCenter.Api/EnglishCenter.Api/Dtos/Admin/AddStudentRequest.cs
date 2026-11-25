using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Api.Dtos.Admin;

public class AddStudentRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Hãy chọn học viên")]
    public int StudentId { get; set; }

    // Ưu đãi riêng cho học viên này (đồng, làm tròn 1.000đ) + lý do bắt buộc khi có ưu đãi
    [Range(0, 1000000000, ErrorMessage = "Ưu đãi không hợp lệ")]
    public decimal ExtraDiscountAmount { get; set; }

    [StringLength(300, ErrorMessage = "Ghi chú tối đa 300 ký tự")]
    public string? DiscountNote { get; set; }

    // Vào lớp giữa khóa: tính học phí theo số buổi còn lại
    public bool ProrateRemaining { get; set; }
}