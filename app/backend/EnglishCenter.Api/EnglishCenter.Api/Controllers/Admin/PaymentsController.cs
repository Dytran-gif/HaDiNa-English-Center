using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Dtos.Common;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/payments")]
[Authorize(Roles = "admin")]
public class PaymentsController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

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
            .Select(p => new { p.CreatedByUserId, Email = p.CreatedByUser.Email, p.Note })
            .SingleAsync();

        return Ok(new PaymentReceiptResponse
        {
            Payment = payment,
            Center = center,
            CreatedByUserId = creator.CreatedByUserId,
            // Admin has no name field/profile in the existing schema.
            CreatedByName = creator.Email,
            CreatedByEmail = creator.Email,
            Note = creator.Note
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync(PaymentRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) || userId < 1)
            return Unauthorized(new { message = "Không xác định được tài khoản lập phiếu" });

        var paidDate = request.PaidDate ?? AppTime.Today;
        if (paidDate > AppTime.Today)
            return BadRequest(new { message = "Ngày thu không được ở tương lai" });

        await using var transaction = await _db.Database.BeginTransactionAsync();
        var enrollments = _db.Enrollments.AsNoTracking();
        enrollments = request.EnrollmentId.HasValue
            ? enrollments.Where(e => e.Id == request.EnrollmentId.Value)
            : enrollments.Where(e => e.StudentId == request.StudentId && e.ClassId == request.ClassId);
        var enrollment = await enrollments
            .Select(e => new { e.Id, e.Status, e.FinalTuitionFee, IsPaid = e.Payment != null })
            .SingleOrDefaultAsync();

        if (enrollment == null)
            return NotFound(new { message = "Không tìm thấy ghi danh của học viên trong lớp đã chọn" });
        if (enrollment.IsPaid)
            return Conflict(new { message = "Ghi danh này đã có phiếu thu, không thể thu thêm" });
        if (enrollment.Status != "Active")
            return BadRequest(new { message = "Học viên phải đang ghi danh (Active) trong lớp đã chọn" });
        if (enrollment.FinalTuitionFee <= 0)
            return BadRequest(new { message = "Chưa hỗ trợ lập phiếu cho ghi danh có học phí bằng 0 hoặc âm" });

        var payment = new Payment
        {
            EnrollmentId = enrollment.Id,
            CreatedByUserId = userId,
            Amount = enrollment.FinalTuitionFee,
            Method = request.Method,
            PaidDate = paidDate,
            Note = request.Note?.Trim(),
            CreatedAt = AppTime.Now
        };
        _db.Payments.Add(payment);

        try
        {
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2601 or 2627 })
        {
            await transaction.RollbackAsync();
            return Conflict(new { message = "Ghi danh này đã có phiếu thu, không thể thu thêm" });
        }

        var result = await AdminPaymentQueries.Project(_db.Payments.AsNoTracking()
            .Where(p => p.Id == payment.Id)).SingleAsync();
        return Created($"/api/admin/payments/{payment.Id}", result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync(string? search, int page = 1, int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = pageSize < 1 ? 10 : Math.Min(100, pageSize);

        var query = _db.Payments.AsNoTracking().WhereContains(search,
            p => p.Enrollment.Student.FullName, p => p.Enrollment.Student.Code);
        var total = await query.CountAsync();
        var skip = ((long)page - 1) * pageSize;
        var items = skip >= total ? new List<PaymentResponse>() :
            await AdminPaymentQueries.Project(query.OrderByDescending(p => p.PaidDate)
                .ThenByDescending(p => p.Id).Skip((int)skip).Take(pageSize)).ToListAsync();

        return Ok(new PagedResult<PaymentResponse>
        {
            Items = items,
            TotalItems = total,
            Page = page,
            PageSize = pageSize
        });
    }
}
