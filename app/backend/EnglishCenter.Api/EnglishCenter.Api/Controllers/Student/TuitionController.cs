using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Học phí của học viên (trang Tuition): danh sách khoản phải đóng + lịch sử thanh toán,
// và thanh toán giả lập (tạo Payment, lưu xuống DB).
// Viết độc lập, truy vấn thẳng AppDbContext.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/tuition")]
public class TuitionController : ControllerBase
{
    private readonly AppDbContext _db;

    public TuitionController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/student/tuition - mỗi ghi danh một dòng kèm thông tin thanh toán (isPaid)
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var rows = await _db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.Id)
            .Select(e => new
            {
                e.Id,
                ClassName = e.Class.Name,
                CourseName = e.Class.Course.Name,
                BandFrom = e.Class.Course.BandFrom,
                BandTo = e.Class.Course.BandTo,
                TotalSessions = e.Class.Course.TotalSessions,
                e.TuitionFee,
                e.DiscountPercent,
                e.DiscountAmount,
                e.FinalTuitionFee,
                PaymentId = e.Payment != null ? (int?)e.Payment.Id : null,
                PaidAmount = e.Payment != null ? (decimal?)e.Payment.Amount : null,
                PaidDate = e.Payment != null ? (DateOnly?)e.Payment.PaidDate : null,
                Method = e.Payment != null ? e.Payment.Method : null,
                Note = e.Payment != null ? e.Payment.Note : null
            })
            .ToListAsync();

        var items = rows.Select(e => new StudentTuitionItemDto
        {
            EnrollmentId = e.Id,
            ClassName = e.ClassName,
            CourseName = e.CourseName,
            BandFrom = e.BandFrom.ToString("0.#"),
            BandTo = e.BandTo.ToString("0.#"),
            TotalSessions = e.TotalSessions,
            TuitionFee = e.TuitionFee,
            DiscountPercent = e.DiscountPercent,
            DiscountAmount = e.DiscountAmount,
            FinalTuitionFee = e.FinalTuitionFee,
            PaymentId = e.PaymentId,
            PaidAmount = e.PaidAmount,
            PaidDate = e.PaidDate,
            Method = e.Method,
            Note = e.Note,
            IsPaid = e.PaidAmount != null
        }).ToList();

        return Ok(items);
    }

    // POST api/student/tuition/pay - thanh toán giả lập: tạo Payment cho các ghi danh chưa đóng của mình
    [HttpPost("pay")]
    public async Task<IActionResult> Pay(TuitionPayRequest req)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var studentId = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (studentId == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var ids = req.EnrollmentIds.Distinct().ToList();
        if (ids.Count == 0)
            return BadRequest(new { message = "Chưa chọn khoản nào để thanh toán" });

        var unpaid = await _db.Enrollments
            .Where(e => e.StudentId == studentId && ids.Contains(e.Id) && e.Payment == null)
            .ToListAsync();

        if (unpaid.Count == 0)
            return StatusCode(409, new { message = "Các khoản đã chọn đều đã thanh toán hoặc không thuộc về bạn" });

        foreach (var e in unpaid)
        {
            _db.Payments.Add(new Payment
            {
                EnrollmentId = e.Id,
                CreatedByUserId = userId,
                Amount = e.FinalTuitionFee,
                Method = "Cash", // giả lập: nộp tiền mặt tại trung tâm
                PaidDate = AppTime.Today,
                Note = "Học viên thanh toán tại trung tâm (giả lập)"
            });
        }

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // unique EnrollmentId (1 ghi danh - 1 phiếu thu): khoản vừa được thanh toán bởi yêu cầu khác
            return StatusCode(409, new { message = "Có khoản vừa được thanh toán, vui lòng tải lại trang" });
        }

        return Ok(new { created = unpaid.Count, message = $"Thanh toán thành công {unpaid.Count} khóa học" });
    }
}
