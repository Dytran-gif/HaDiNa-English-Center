using System.Data;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

public class PaymentResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string Message { get; init; } = "";
    public int? PaymentId { get; init; }

    public static PaymentResult Ok(string message, int? id = null) => new() { Success = true, StatusCode = 200, Message = message, PaymentId = id };
    public static PaymentResult Fail(int code, string message) => new() { Success = false, StatusCode = code, Message = message };
}

// Số tiền của một ghi danh
public record TuitionBalance(decimal Final, decimal Paid, decimal Refunded, decimal Pending)
{
    public decimal Net => Paid - Refunded;                     // đã thu thực
    public decimal Remaining => Math.Max(0, Final - Net);      // còn nợ
    public string Status => Net <= 0 && Refunded > 0 ? "Refunded"
        : Net <= 0 ? "Unpaid"
        : Net < Final ? "Partial"
        : "Paid";
}

// Mọi thay đổi tiền học đi qua đây.
// - Admin lập phiếu thu (Confirmed ngay) hoặc phiếu hoàn (Refund, Confirmed ngay).
// - Học viên chỉ gửi yêu cầu (Pending, chuyển khoản); Admin xác nhận / từ chối.
// - Phiếu đã xác nhận không xóa, chỉ hủy (Cancelled) kèm lý do.
// Doanh thu = tổng Confirmed (Payment) - tổng Confirmed (Refund), theo ngày ConfirmedAt.
public class PaymentService
{
    public const string Pending = "Pending", Confirmed = "Confirmed", Rejected = "Rejected", Cancelled = "Cancelled";
    public const string KindPayment = "Payment", KindRefund = "Refund";

    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db)
    {
        _db = db;
    }

    public static TuitionBalance Balance(decimal final, IEnumerable<Payment> payments)
    {
        var list = payments.ToList();
        return new TuitionBalance(final,
            list.Where(p => p.Status == Confirmed && p.Kind == KindPayment).Sum(p => p.Amount),
            list.Where(p => p.Status == Confirmed && p.Kind == KindRefund).Sum(p => p.Amount),
            list.Where(p => p.Status == Pending && p.Kind == KindPayment).Sum(p => p.Amount));
    }

    private async Task<(Enrollment? enrollment, TuitionBalance balance)> LoadAsync(int enrollmentId)
    {
        var e = await _db.Enrollments.Include(x => x.Payments).Include(x => x.Student).FirstOrDefaultAsync(x => x.Id == enrollmentId);
        return (e, e == null ? new TuitionBalance(0, 0, 0, 0) : Balance(e.FinalTuitionFee, e.Payments));
    }

    private static string? Clean(string? s, int max) =>
        string.IsNullOrWhiteSpace(s) ? null : s.Trim().Length > max ? s.Trim()[..max] : s.Trim();

    // Lưu kèm cấp số biên lai; thử lại nếu trùng số do 2 người lập cùng lúc
    private async Task SaveWithReceiptAsync(Payment p)
    {
        for (var attempt = 1; ; attempt++)
        {
            if (p.Status == Confirmed && p.ReceiptNo == null)
                p.ReceiptNo = await Codes.NextReceiptNoAsync(_db, DateOnly.FromDateTime(p.ConfirmedAt ?? AppTime.Now));
            try
            {
                await _db.SaveChangesAsync();
                return;
            }
            catch (DbUpdateException) when (attempt < 3 && p.Status == Confirmed)
            {
                p.ReceiptNo = null;
            }
        }
    }

    // Admin lập phiếu thu: tiền mặt / chuyển khoản đã nhận, ghi nhận ngay
    public async Task<PaymentResult> CreateConfirmedAsync(int adminUserId, int enrollmentId, decimal amount, string method,
        DateOnly? paidDate, string? transferRef, string? note)
    {
        var studentId = await _db.Enrollments.Where(e => e.Id == enrollmentId).Select(e => (int?)e.StudentId).FirstOrDefaultAsync();
        if (studentId == null) return PaymentResult.Fail(404, "Không tìm thấy ghi danh");
        await using var tx = await _db.Database.BeginTransactionAsync();
        await StudentLifecycle.LockAsync(_db, studentId.Value);
        var (e, bal) = await LoadAsync(enrollmentId);
        if (e == null) return PaymentResult.Fail(404, "Không tìm thấy ghi danh");
        if (e.Status == "Dropped" || e.Student.DeletedAt != null) return PaymentResult.Fail(409, "Học viên đã nghỉ lớp này, không thu thêm");
        if (amount <= 0) return PaymentResult.Fail(400, "Số tiền phải lớn hơn 0");
        if (bal.Remaining <= 0) return PaymentResult.Fail(409, "Ghi danh này đã đóng đủ học phí");
        if (amount > bal.Remaining)
            return PaymentResult.Fail(400, $"Số tiền vượt số còn nợ ({bal.Remaining:N0}đ)");
        var date = paidDate ?? AppTime.Today;
        if (date > AppTime.Today) return PaymentResult.Fail(400, "Ngày thu không được ở tương lai");

        var now = AppTime.Now;
        var p = new Payment
        {
            EnrollmentId = e.Id, CreatedByUserId = adminUserId, Kind = KindPayment, Status = Confirmed,
            Amount = amount, Method = method, PaidDate = date, TransferRef = Clean(transferRef, 100), Note = Clean(note, 500),
            ConfirmedByUserId = adminUserId, ConfirmedAt = now, CreatedAt = now
        };
        _db.Payments.Add(p);
        await SaveWithReceiptAsync(p);
        await tx.CommitAsync();
        return PaymentResult.Ok($"Đã lập phiếu thu {p.ReceiptNo}", p.Id);
    }

    // Học viên báo đã chuyển khoản: tạo yêu cầu chờ xác nhận, chưa tính doanh thu
    public async Task<PaymentResult> RequestTransferAsync(int studentUserId, int studentId, int enrollmentId,
        decimal amount, string? transferRef, string? note)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        await StudentLifecycle.LockAsync(_db, studentId);
        var (e, bal) = await LoadAsync(enrollmentId);
        if (e == null || e.StudentId != studentId) return PaymentResult.Fail(404, "Không tìm thấy khoản học phí");
        if (e.Status == "Dropped" || e.Student.DeletedAt != null) return PaymentResult.Fail(409, "Bạn đã nghỉ lớp này");
        if (amount <= 0) return PaymentResult.Fail(400, "Số tiền phải lớn hơn 0");
        var canRequest = bal.Remaining - bal.Pending;
        if (canRequest <= 0)
            return PaymentResult.Fail(409, bal.Pending > 0
                ? "Bạn đã gửi yêu cầu cho toàn bộ số còn lại, vui lòng chờ trung tâm xác nhận"
                : "Khoản này đã đóng đủ");
        if (amount > canRequest)
            return PaymentResult.Fail(400, $"Số tiền vượt số còn phải đóng ({canRequest:N0}đ)");

        var now = AppTime.Now;
        var p = new Payment
        {
            EnrollmentId = e.Id, CreatedByUserId = studentUserId, Kind = KindPayment, Status = Pending,
            Amount = amount, Method = "Transfer", PaidDate = AppTime.Today,
            TransferRef = Clean(transferRef, 100), Note = Clean(note, 500), CreatedAt = now
        };
        _db.Payments.Add(p);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        return PaymentResult.Ok("Đã gửi yêu cầu, trung tâm sẽ xác nhận sau khi kiểm tra tài khoản", p.Id);
    }

    // Admin xác nhận yêu cầu chuyển khoản -> thành phiếu thu
    public async Task<PaymentResult> ConfirmAsync(int adminUserId, int paymentId, DateOnly? paidDate)
    {
        var studentId = await _db.Payments.Where(p => p.Id == paymentId).Select(p => (int?)p.Enrollment.StudentId).FirstOrDefaultAsync();
        if (studentId == null) return PaymentResult.Fail(404, "Không tìm thấy yêu cầu");
        await using var tx = await _db.Database.BeginTransactionAsync();
        await StudentLifecycle.LockAsync(_db, studentId.Value);
        var p = await _db.Payments.FirstOrDefaultAsync(x => x.Id == paymentId);
        if (p == null) return PaymentResult.Fail(404, "Không tìm thấy yêu cầu");
        if (p.Status != Pending) return PaymentResult.Fail(409, "Yêu cầu này đã được xử lý");
        var (enrollment, bal) = await LoadAsync(p.EnrollmentId);
        if (enrollment == null || enrollment.Student.DeletedAt != null || enrollment.Status == "Dropped")
            return PaymentResult.Fail(409, "Học viên đã nghỉ hoặc đã được xóa, không xác nhận khoản thu mới");
        if (p.Amount > bal.Remaining)
            return PaymentResult.Fail(409, $"Số tiền yêu cầu vượt số còn nợ ({bal.Remaining:N0}đ). Hãy từ chối và lập phiếu đúng số");
        var date = paidDate ?? p.PaidDate;
        if (date > AppTime.Today) return PaymentResult.Fail(400, "Ngày nhận tiền không được ở tương lai");

        p.Status = Confirmed;
        p.PaidDate = date;
        p.ConfirmedByUserId = adminUserId;
        p.ConfirmedAt = AppTime.Now;
        await SaveWithReceiptAsync(p);
        await tx.CommitAsync();
        return PaymentResult.Ok($"Đã xác nhận, số biên lai {p.ReceiptNo}", p.Id);
    }

    public async Task<PaymentResult> RejectAsync(int adminUserId, int paymentId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) return PaymentResult.Fail(400, "Cần nhập lý do từ chối");
        var p = await _db.Payments.FirstOrDefaultAsync(x => x.Id == paymentId);
        if (p == null) return PaymentResult.Fail(404, "Không tìm thấy yêu cầu");
        if (p.Status != Pending) return PaymentResult.Fail(409, "Yêu cầu này đã được xử lý");
        p.Status = Rejected;
        p.CancelReason = Clean(reason, 300);
        p.ConfirmedByUserId = adminUserId;
        p.ConfirmedAt = AppTime.Now;
        await _db.SaveChangesAsync();
        return PaymentResult.Ok("Đã từ chối yêu cầu", p.Id);
    }

    // Hủy phiếu đã xác nhận (lập nhầm). Không xóa: giữ số biên lai, doanh thu tự trừ ra.
    public async Task<PaymentResult> CancelAsync(int adminUserId, int paymentId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) return PaymentResult.Fail(400, "Cần nhập lý do hủy phiếu");
        var p = await _db.Payments.FirstOrDefaultAsync(x => x.Id == paymentId);
        if (p == null) return PaymentResult.Fail(404, "Không tìm thấy phiếu");
        if (p.Status != Confirmed) return PaymentResult.Fail(409, "Chỉ hủy được phiếu đã xác nhận");
        if (p.Kind == KindPayment)
        {
            // Không để số đã hoàn lớn hơn số đã thu sau khi hủy
            var (_, bal) = await LoadAsync(p.EnrollmentId);
            if (bal.Paid - p.Amount < bal.Refunded)
                return PaymentResult.Fail(409, "Ghi danh này đã có phiếu hoàn, hãy hủy phiếu hoàn trước");
        }
        p.Status = Cancelled;
        p.CancelReason = Clean(reason, 300);
        p.Note = Clean($"{p.Note} [Hủy bởi user #{adminUserId} lúc {AppTime.Now:dd/MM/yyyy HH:mm}]", 500);
        await _db.SaveChangesAsync();
        return PaymentResult.Ok($"Đã hủy phiếu {p.ReceiptNo}", p.Id);
    }

    // Phiếu hoàn tiền (học viên nghỉ...). Không vượt số đã thu thực.
    public async Task<PaymentResult> RefundAsync(int adminUserId, int enrollmentId, decimal amount, string method, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) return PaymentResult.Fail(400, "Cần nhập lý do hoàn tiền");
        var (e, bal) = await LoadAsync(enrollmentId);
        if (e == null) return PaymentResult.Fail(404, "Không tìm thấy ghi danh");
        if (amount <= 0) return PaymentResult.Fail(400, "Số tiền phải lớn hơn 0");
        if (amount > bal.Net) return PaymentResult.Fail(400, $"Số hoàn vượt số đã thu ({bal.Net:N0}đ)");

        var now = AppTime.Now;
        var p = new Payment
        {
            EnrollmentId = e.Id, CreatedByUserId = adminUserId, Kind = KindRefund, Status = Confirmed,
            Amount = amount, Method = method, PaidDate = AppTime.Today, Note = Clean(reason, 500),
            ConfirmedByUserId = adminUserId, ConfirmedAt = now, CreatedAt = now
        };
        _db.Payments.Add(p);
        await SaveWithReceiptAsync(p);
        return PaymentResult.Ok($"Đã lập phiếu hoàn {p.ReceiptNo}", p.Id);
    }
}
