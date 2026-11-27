using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Dtos.Common;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

// Học phí: phiếu thu (nhiều đợt), yêu cầu chuyển khoản của học viên chờ xác nhận, hủy phiếu, hoàn tiền, công nợ.
// Mọi thay đổi tiền đi qua PaymentService. Doanh thu chỉ tính phiếu Confirmed.
[ApiController]
[Route("api/admin/payments")]
[Authorize(Roles = "admin")]
public class PaymentsController(AppDbContext db, PaymentService payments) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly PaymentService _payments = payments;

    private int UserId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

    private IActionResult FromResult(PaymentResult r, Func<int, object?>? ok = null) =>
        r.Success ? Ok(new { message = r.Message, id = r.PaymentId }) : StatusCode(r.StatusCode, new { message = r.Message });

    // GET api/admin/payments/5 - biên lai
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        var payment = await AdminPaymentQueries.Project(_db.Payments.AsNoTracking()
            .Where(p => p.Id == id)).SingleOrDefaultAsync();
        if (payment == null)
            return NotFound(new { message = "Không tìm thấy phiếu thu" });

        var center = await _db.CenterSettings.AsNoTracking().Where(c => c.Id == 1)
            .Select(c => new CenterSettingResponse
            {
                Name = c.Name, LogoUrl = c.LogoUrl, Address = c.Address, Phone = c.Phone
            }).SingleOrDefaultAsync();
        if (center == null)
            return NotFound(new { message = "Chưa có thông tin trung tâm để lập biên lai" });

        var creator = await _db.Payments.AsNoTracking().Where(p => p.Id == id)
            .Select(p => new
            {
                p.CreatedByUserId, Email = p.CreatedByUser.Email, p.Note,
                Name = p.ConfirmedByUser != null ? (p.ConfirmedByUser.FullName ?? p.ConfirmedByUser.Email)
                    : (p.CreatedByUser.FullName ?? p.CreatedByUser.Email)
            })
            .SingleAsync();

        return Ok(new PaymentReceiptResponse
        {
            Payment = payment,
            Center = center,
            CreatedByUserId = creator.CreatedByUserId,
            CreatedByName = creator.Name,
            CreatedByEmail = creator.Email,
            Note = creator.Note
        });
    }

    // POST api/admin/payments - lập phiếu thu (thu đủ hoặc một đợt). Tiền đã nhận nên Confirmed ngay.
    [HttpPost]
    public async Task<IActionResult> CreateAsync(PaymentRequest request)
    {
        if (UserId < 1)
            return Unauthorized(new { message = "Không xác định được tài khoản lập phiếu" });

        var query = _db.Enrollments.AsNoTracking();
        query = request.EnrollmentId.HasValue
            ? query.Where(e => e.Id == request.EnrollmentId.Value)
            : query.Where(e => e.StudentId == request.StudentId && e.ClassId == request.ClassId);
        var enrollment = await AdminPaymentQueries.Receivables(query).SingleOrDefaultAsync();
        if (enrollment == null)
            return NotFound(new { message = "Không tìm thấy ghi danh của học viên trong lớp đã chọn" });

        var remaining = new TuitionBalance(enrollment.FinalTuitionFee, enrollment.PaidAmount,
            enrollment.RefundedAmount, enrollment.PendingAmount).Remaining;
        var amount = request.Amount ?? remaining;
        var result = await _payments.CreateConfirmedAsync(UserId, enrollment.EnrollmentId, amount, request.Method,
            request.PaidDate, request.TransferRef, request.Note);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        var created = await AdminPaymentQueries.Project(_db.Payments.AsNoTracking()
            .Where(p => p.Id == result.PaymentId)).SingleAsync();
        return Created($"/api/admin/payments/{created.Id}", created);
    }

    // GET api/admin/payments?search=&status=&kind=&method=&from=&to=&page=1&pageSize=10
    // Lọc ở server (trước đây FE tải hết các trang rồi mới lọc).
    [HttpGet]
    public async Task<IActionResult> GetAllAsync(string? search, string? status, string? kind, string? method,
        DateOnly? from, DateOnly? to, int page = 1, int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = pageSize < 1 ? 10 : Math.Min(100, pageSize);
        if (from.HasValue && to.HasValue && from > to)
            return BadRequest(new { message = "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc" });

        var query = _db.Payments.AsNoTracking().WhereContains(search,
            p => p.Enrollment.Student.FullName, p => p.Enrollment.Student.Code, p => p.Enrollment.Class.Name,
            p => p.ReceiptNo ?? "", p => p.TransferRef ?? "");
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(p => p.Status == status);
        if (!string.IsNullOrWhiteSpace(kind)) query = query.Where(p => p.Kind == kind);
        if (!string.IsNullOrWhiteSpace(method)) query = query.Where(p => p.Method == method);
        if (from.HasValue) query = query.Where(p => p.PaidDate >= from.Value);
        if (to.HasValue) query = query.Where(p => p.PaidDate <= to.Value);

        var total = await query.CountAsync();
        var skip = ((long)page - 1) * pageSize;
        var items = skip >= total ? new List<PaymentResponse>() :
            await AdminPaymentQueries.Project(query.OrderByDescending(p => p.CreatedAt)
                .ThenByDescending(p => p.Id).Skip((int)skip).Take(pageSize)).ToListAsync();

        return Ok(new PagedResult<PaymentResponse>
        {
            Items = items,
            TotalItems = total,
            Page = page,
            PageSize = pageSize
        });
    }

    // GET api/admin/payments/summary - phải thu / đã thu / còn nợ / chờ xác nhận
    [HttpGet("summary")]
    public async Task<IActionResult> SummaryAsync()
    {
        var rows = await AdminPaymentQueries.Receivables(_db.Enrollments.AsNoTracking()).ToListAsync();
        var active = rows.Where(r => r.EnrollmentStatus != "Dropped").ToList();
        var pending = await _db.Payments.AsNoTracking().Where(p => p.Status == PaymentService.Pending)
            .GroupBy(_ => 1).Select(g => new { Count = g.Count(), Amount = g.Sum(p => p.Amount) }).FirstOrDefaultAsync();
        var outstanding = active.Select(r => new TuitionBalance(r.FinalTuitionFee, r.PaidAmount, r.RefundedAmount, r.PendingAmount))
            .ToList();
        return Ok(new PaymentSummaryResponse
        {
            Receivable = active.Sum(r => r.FinalTuitionFee),
            Collected = rows.Sum(r => r.PaidAmount - r.RefundedAmount),
            Outstanding = outstanding.Sum(b => b.Remaining),
            DebtorCount = outstanding.Count(b => b.Remaining > 0),
            PendingCount = pending?.Count ?? 0,
            PendingAmount = pending?.Amount ?? 0
        });
    }

    // GET api/admin/payments/receivables?search=&onlyDebt=true&page=1 - công nợ theo ghi danh
    [HttpGet("receivables")]
    public async Task<IActionResult> ReceivablesAsync(string? search, bool onlyDebt = true, int page = 1, int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = pageSize < 1 ? 10 : Math.Min(100, pageSize);
        var query = _db.Enrollments.AsNoTracking().Where(e => e.Status != "Dropped")
            .WhereContains(search, e => e.Student.FullName, e => e.Student.Code, e => e.Class.Name);
        var all = await AdminPaymentQueries.Receivables(query
            .OrderBy(e => e.Class.StartDate).ThenBy(e => e.Student.FullName)).ToListAsync();
        foreach (var r in all)
        {
            var b = new TuitionBalance(r.FinalTuitionFee, r.PaidAmount, r.RefundedAmount, r.PendingAmount);
            r.RemainingAmount = b.Remaining;
            r.PaymentStatus = b.Status;
        }
        var filtered = onlyDebt ? all.Where(r => r.RemainingAmount > 0).ToList() : all;
        return Ok(new PagedResult<ReceivableResponse>
        {
            Items = filtered.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
            TotalItems = filtered.Count,
            Page = page,
            PageSize = pageSize
        });
    }

    // POST api/admin/payments/5/confirm { paidDate? } - xác nhận yêu cầu chuyển khoản của học viên
    [HttpPost("{id:int}/confirm")]
    public async Task<IActionResult> ConfirmAsync(int id, PaymentDecisionRequest? req) =>
        FromResult(await _payments.ConfirmAsync(UserId, id, req?.PaidDate));

    // POST api/admin/payments/5/reject { reason }
    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> RejectAsync(int id, PaymentDecisionRequest req) =>
        FromResult(await _payments.RejectAsync(UserId, id, req.Reason ?? ""));

    // POST api/admin/payments/5/cancel { reason } - hủy phiếu đã xác nhận (lập nhầm)
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> CancelAsync(int id, PaymentDecisionRequest req) =>
        FromResult(await _payments.CancelAsync(UserId, id, req.Reason ?? ""));

    // POST api/admin/payments/refunds { enrollmentId, amount, method, reason }
    [HttpPost("refunds")]
    public async Task<IActionResult> RefundAsync(RefundRequest req) =>
        FromResult(await _payments.RefundAsync(UserId, req.EnrollmentId, req.Amount, req.Method, req.Reason));
}
