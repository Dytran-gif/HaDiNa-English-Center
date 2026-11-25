using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Học phí của học viên: chỉ XEM (phải đóng, đã đóng, còn nợ, biên lai) và BÁO đã chuyển khoản.
// Học viên không tự tạo phiếu thu: yêu cầu chuyển khoản ở trạng thái Pending, Admin xác nhận mới thành phiếu thu.
[Route("api/student/tuition")]
public class TuitionController : StudentControllerBase
{
    private readonly PaymentService _payments;
    private readonly IConfiguration _config;

    public TuitionController(AppDbContext db, PaymentService payments, IConfiguration config) : base(db)
    {
        _payments = payments;
        _config = config;
    }

    // GET api/student/tuition - học phí từng ghi danh kèm các phiếu
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var rows = await LoadMyEnrollmentsAsync();
        var items = rows.OrderByDescending(r => r.StartDate).Select(e =>
        {
            var b = e.Balance;
            var lastPaid = e.Payments.Where(p => p.Status == PaymentService.Confirmed && p.Kind == PaymentService.KindPayment)
                .OrderByDescending(p => p.Id).FirstOrDefault();
            return new StudentTuitionItemDto
            {
                EnrollmentId = e.EnrollmentId,
                ClassId = e.ClassId,
                ClassCode = e.ClassCode,
                EnrollmentStatus = e.Status,
                ClassName = e.ClassName,
                CourseName = e.CourseName,
                BandFrom = e.BandFrom.ToString("0.#"),
                BandTo = e.BandTo.ToString("0.#"),
                TotalSessions = e.TotalSessions,
                TuitionFee = e.TuitionFee,
                DiscountPercent = e.DiscountPercent,
                DiscountAmount = e.DiscountAmount,
                ExtraDiscountAmount = e.ExtraDiscountAmount,
                DiscountNote = e.DiscountNote,
                FinalTuitionFee = e.FinalTuitionFee,
                PaymentId = lastPaid?.Id,
                PaidAmount = b.Net > 0 ? b.Net : null,
                PaidDate = lastPaid?.PaidDate,
                Method = lastPaid?.Method,
                Note = e.DiscountNote,
                IsPaid = b.Remaining == 0,
                PendingAmount = b.Pending,
                RemainingAmount = b.Remaining,
                PaymentStatus = b.Status,
                Payments = e.Payments.OrderByDescending(p => p.CreatedAt).Select(p => new StudentPaymentDto
                {
                    Id = p.Id,
                    ReceiptNo = p.ReceiptNo,
                    Kind = p.Kind,
                    Status = p.Status,
                    Amount = p.Amount,
                    Method = p.Method,
                    PaidDate = p.PaidDate,
                    TransferRef = p.TransferRef,
                    CancelReason = p.CancelReason,
                    CreatedAt = p.CreatedAt
                }).ToList()
            };
        }).ToList();

        return Ok(items);
    }

    // GET api/student/tuition/bank-info - tài khoản nhận chuyển khoản (appsettings: Payment:Bank)
    [HttpGet("bank-info")]
    public IActionResult BankInfo()
    {
        var section = _config.GetSection("Payment:Bank");
        return Ok(new BankInfoDto
        {
            BankName = section["BankName"] ?? "",
            AccountNumber = section["AccountNumber"] ?? "",
            AccountName = section["AccountName"] ?? "",
            Branch = section["Branch"]
        });
    }

    // POST api/student/tuition/transfer-requests { enrollmentId, amount, transferRef?, note? }
    // Báo đã chuyển khoản -> Pending, chưa tính đã đóng cho đến khi trung tâm xác nhận.
    [HttpPost("transfer-requests")]
    public async Task<IActionResult> RequestTransfer(TransferRequestDto req)
    {
        var result = await _payments.RequestTransferAsync(UserId, StudentId, req.EnrollmentId, req.Amount, req.TransferRef, req.Note);
        if (!result.Success) return Error(result.StatusCode, result.Message);
        return StatusCode(201, new { message = result.Message, id = result.PaymentId });
    }
}
