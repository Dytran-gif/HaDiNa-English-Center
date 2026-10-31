namespace EnglishCenter.Api.Dtos.Admin;

public class PaymentResponse
{
    public int Id { get; set; }
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public string StudentCode { get; set; } = "";
    public string StudentName { get; set; } = "";
    public int ClassId { get; set; }
    public string ClassName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public decimal TuitionFee { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaidDate { get; set; }
    public string Method { get; set; } = "";
}

public class PaymentReceiptResponse
{
    public PaymentResponse Payment { get; set; } = new();
    public CenterSettingResponse Center { get; set; } = new();
    public int CreatedByUserId { get; set; }
    public string CreatedByName { get; set; } = "";
    public string CreatedByEmail { get; set; } = "";
    public string? Note { get; set; }
}

public class StudentPaymentsResponse
{
    public List<PaymentResponse> Items { get; set; } = new();
    public decimal TotalPaid { get; set; }
}
