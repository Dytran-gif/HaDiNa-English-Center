using System.Data;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

public class EnrollmentResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string Message { get; init; } = "";
    public int? EnrollmentId { get; init; }

    public static EnrollmentResult Ok(string message = "", int? enrollmentId = null) =>
        new() { Success = true, StatusCode = 200, Message = message, EnrollmentId = enrollmentId };

    public static EnrollmentResult Fail(int statusCode, string message) =>
        new() { Success = false, StatusCode = statusCode, Message = message };
}

// Tùy chọn khi Admin ghi danh (học viên tự đăng ký thì không có)
public record EnrollOptions(decimal ExtraDiscountAmount = 0, string? DiscountNote = null, bool ProrateRemaining = false);

// Học phí của một ghi danh (làm tròn đến 1.000đ)
public record TuitionQuote(decimal TuitionFee, decimal DiscountPercent, decimal DiscountAmount,
    decimal ExtraDiscountAmount, decimal FinalTuitionFee, string? Note);

// Lý do một lớp không đăng ký được (null = được)
public record ClassAvailability(bool IsFull, bool IsFinished, string? Conflict, string? AlreadyInCourse)
{
    public bool CanEnroll => !IsFull && !IsFinished && Conflict == null && AlreadyInCourse == null;
    public string? Reason => IsFinished ? "Lớp đã kết thúc"
        : IsFull ? "Lớp đã đủ sĩ số"
        : AlreadyInCourse != null ? $"Bạn đang học khóa này ở lớp {AlreadyInCourse}"
        : Conflict != null ? $"Trùng lịch với {Conflict}"
        : null;
}

// Luật ghi danh dùng chung cho Admin và học viên tự đăng ký:
// lớp chưa kết thúc, còn chỗ, không trùng lịch với lớp đang/sắp học, không đang học khóa đó ở lớp khác.
public class EnrollmentService
{
    private readonly AppDbContext _db;

    public EnrollmentService(AppDbContext db)
    {
        _db = db;
    }

    public static decimal RoundVnd(decimal amount) =>
        Math.Round(amount / 1000m, 0, MidpointRounding.AwayFromZero) * 1000m;

    // Học phí: (tính theo số buổi còn lại nếu chọn) - giảm % theo khóa - ưu đãi riêng; làm tròn 1.000đ
    public static TuitionQuote Quote(decimal courseTuition, decimal discountPercent, decimal extraDiscount,
        int remainingSessions, int totalSessions, bool prorate, string? note)
    {
        var tuition = courseTuition;
        var notes = new List<string>();
        if (prorate && totalSessions > 0 && remainingSessions < totalSessions)
        {
            tuition = RoundVnd(courseTuition * remainingSessions / totalSessions);
            notes.Add($"Tính theo {remainingSessions}/{totalSessions} buổi còn lại");
        }
        var percentAmount = RoundVnd(tuition * discountPercent / 100);
        var extra = Math.Min(RoundVnd(Math.Max(0, extraDiscount)), tuition - percentAmount);
        if (!string.IsNullOrWhiteSpace(note)) notes.Add(note.Trim());
        return new TuitionQuote(tuition, discountPercent, percentAmount + extra, extra,
            tuition - percentAmount - extra, notes.Count == 0 ? null : string.Join("; ", notes));
    }

    private record ClassInfo(int Id, string Name, int CourseId, string CourseName, DateOnly StartDate,
        DateOnly EndDate, int MaxStudents, List<ClassCalendar.Slot> Slots);

    private async Task<List<ClassInfo>> LoadClassesAsync(IQueryable<CourseClass> query) =>
        (await query.AsNoTracking()
            .Select(c => new
            {
                c.Id, c.Name, c.CourseId, CourseName = c.Course.Name, c.StartDate, c.EndDate, c.MaxStudents,
                Slots = c.Schedules.Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime }).ToList()
            })
            .ToListAsync())
        .Select(c => new ClassInfo(c.Id, c.Name, c.CourseId, c.CourseName, c.StartDate, c.EndDate, c.MaxStudents,
            c.Slots.Select(s => new ClassCalendar.Slot(s.DayOfWeek, s.StartTime, s.EndTime)).ToList()))
        .ToList();

    // Kiểm tra nhiều lớp cùng lúc cho một học viên (trang chọn lớp)
    public async Task<Dictionary<int, ClassAvailability>> CheckAsync(int studentId, IEnumerable<int> classIds)
    {
        var ids = classIds.Distinct().ToList();
        var today = AppTime.Today;
        var targets = await LoadClassesAsync(_db.Classes.Where(c => ids.Contains(c.Id)));
        var counts = await _db.Enrollments.AsNoTracking()
            .Where(e => ids.Contains(e.ClassId) && e.Status == "Active")
            .GroupBy(e => e.ClassId).Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        // Lớp học viên đang/sắp học (chưa kết thúc)
        var mine = await LoadClassesAsync(_db.Classes.Where(c => c.EndDate >= today
            && c.Enrollments.Any(e => e.StudentId == studentId && e.Status == "Active")));

        var result = new Dictionary<int, ClassAvailability>();
        foreach (var t in targets)
        {
            var same = mine.FirstOrDefault(m => m.CourseId == t.CourseId && m.Id != t.Id);
            string? conflict = null;
            foreach (var m in mine.Where(m => m.Id != t.Id))
                if (ClassCalendar.Overlaps(t.StartDate, t.EndDate, t.Slots, m.StartDate, m.EndDate, m.Slots, out var clash))
                {
                    conflict = $"{m.CourseName} ({m.Name}) {ClassCalendar.DayNameVi(clash!.DayOfWeek)} " +
                               $"{clash.StartTime:HH\\:mm}-{clash.EndTime:HH\\:mm}";
                    break;
                }
            result[t.Id] = new ClassAvailability(
                IsFull: counts.GetValueOrDefault(t.Id) >= t.MaxStudents,
                IsFinished: t.EndDate < today,
                Conflict: conflict,
                AlreadyInCourse: same?.Name);
        }
        return result;
    }

    // Ghi danh học viên vào lớp. Học phí lấy từ khóa học, KHÔNG nhận từ client (trừ ưu đãi riêng của Admin).
    public async Task<EnrollmentResult> EnrollAsync(int studentId, int classId, EnrollOptions? options = null, int? courseRegistrationId = null)
    {
        options ??= new EnrollOptions();
        var student = await _db.Students.FindAsync(studentId);
        if (student == null || student.DeletedAt != null)
            return EnrollmentResult.Fail(404, "Không tìm thấy học viên");
        if (student.Status == "Dropped")
            return EnrollmentResult.Fail(409, "Học viên đã nghỉ, không thể ghi danh");

        // Serializable: hai người đăng ký cùng lúc không vượt sĩ số
        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        await StudentLifecycle.LockAsync(_db, studentId);

        // Recheck inside the transaction: the student may have been deleted after the initial read.
        if (!await _db.Students.AnyAsync(s => s.Id == studentId && s.DeletedAt == null && s.Status != "Dropped"))
            return EnrollmentResult.Fail(409, "Học viên đã nghỉ hoặc đã được xóa, không thể ghi danh");

        await ClassLifecycle.LockAsync(_db, classId);
        var cls = await _db.Classes.AsNoTracking().Include(c => c.Course).Include(c => c.Schedules).FirstOrDefaultAsync(c => c.Id == classId);
        if (cls == null) return EnrollmentResult.Fail(404, "Không tìm thấy lớp học");

        var registration = await _db.CourseRegistrations.FirstOrDefaultAsync(r => r.StudentId == studentId && r.Status == "Pending"
            && (courseRegistrationId.HasValue ? r.Id == courseRegistrationId.Value : r.CourseId == cls.CourseId));
        if (courseRegistrationId.HasValue && registration == null)
            return EnrollmentResult.Fail(409, "Yêu cầu đăng ký đã được xử lý hoặc đã hủy");
        if (registration != null && registration.CourseId != cls.CourseId)
            return EnrollmentResult.Fail(400, "Lớp được chọn không thuộc khóa học đã đăng ký");

        if (await _db.Enrollments.AnyAsync(e => e.StudentId == studentId && e.ClassId == classId))
            return EnrollmentResult.Fail(409, "Học viên đã có ghi danh trong lớp này");

        if (!(await CheckAsync(studentId, new[] { classId })).TryGetValue(classId, out var check))
            return EnrollmentResult.Fail(404, "Không tìm thấy lớp học");
        if (check.IsFinished)
            return EnrollmentResult.Fail(409, "Lớp đã kết thúc, không thể ghi danh");
        if (check.IsFull)
        {
            var active = await _db.Enrollments.CountAsync(e => e.ClassId == classId && e.Status == "Active");
            return EnrollmentResult.Fail(409, $"Lớp đã đầy ({active}/{cls.MaxStudents})");
        }
        if (check.AlreadyInCourse != null)
            return EnrollmentResult.Fail(409, $"Học viên đang học khóa {cls.Course.Name} ở lớp {check.AlreadyInCourse}");
        if (check.Conflict != null)
            return EnrollmentResult.Fail(409, $"Không thể ghi danh: lịch học trùng với {check.Conflict}");

        var slots = cls.Schedules.Select(s => new ClassCalendar.Slot(s.DayOfWeek, s.StartTime, s.EndTime)).ToList();
        var total = ClassCalendar.TotalSessions(cls.StartDate, cls.EndDate, slots);
        var done = ClassCalendar.DoneSessions(cls.StartDate, cls.EndDate, slots, AppTime.Today.AddDays(-1));
        var quote = Quote(cls.Course.Tuition, cls.Course.DiscountPercent, options.ExtraDiscountAmount,
            total - done, total, options.ProrateRemaining, options.DiscountNote);

        var enrollment = new Enrollment
        {
            StudentId = studentId,
            ClassId = classId,
            TuitionFee = quote.TuitionFee,
            DiscountPercent = quote.DiscountPercent,
            DiscountAmount = quote.DiscountAmount,
            ExtraDiscountAmount = quote.ExtraDiscountAmount,
            DiscountNote = quote.Note,
            FinalTuitionFee = quote.FinalTuitionFee,
            Status = "Active"
        };
        _db.Enrollments.Add(enrollment);
        if (registration != null)
        {
            registration.Status = "Assigned";
            registration.ClassId = classId;
            registration.AssignedAt = AppTime.Now;
        }

        try
        {
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateException)
        {
            // unique index (StudentId, ClassId) / deadlock khi 2 request trùng nhau cùng lúc
            return EnrollmentResult.Fail(409, "Không ghi danh được do có yêu cầu khác cùng lúc, vui lòng thử lại");
        }

        return EnrollmentResult.Ok($"Đã ghi danh vào lớp {cls.Name}", enrollment.Id);
    }

    // Rút / hủy ghi danh.
    // - Chưa có phiếu thu đã xác nhận và lớp chưa khai giảng: xóa hẳn (kèm yêu cầu thanh toán đang chờ/bị từ chối).
    // - Còn lại: chuyển sang Dropped để giữ lịch sử điểm danh, bài nộp, phiếu thu (hoàn tiền lập phiếu Refund riêng).
    public async Task<EnrollmentResult> WithdrawAsync(int studentId, int enrollmentId, bool byStudent = false)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        await StudentLifecycle.LockAsync(_db, studentId);
        var enrollment = await _db.Enrollments
            .Include(e => e.Payments)
            .Include(e => e.Class)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId && e.StudentId == studentId && e.Student.DeletedAt == null);

        if (enrollment == null)
            return EnrollmentResult.Fail(404, "Không tìm thấy ghi danh");

        var hasConfirmed = enrollment.Payments.Any(p => p.Status == "Confirmed");
        var started = enrollment.Class.StartDate <= AppTime.Today;

        if (byStudent)
        {
            if (hasConfirmed)
                return EnrollmentResult.Fail(409, "Khóa đã đóng học phí, liên hệ trung tâm để hủy và hoàn tiền");
            if (started)
                return EnrollmentResult.Fail(409, "Lớp đã khai giảng, liên hệ trung tâm để nghỉ học");
        }

        var assignedRequests = await _db.CourseRegistrations.Where(r => r.StudentId == studentId && r.ClassId == enrollment.ClassId && r.Status == "Assigned").ToListAsync();
        foreach (var registration in assignedRequests) registration.Status = "Cancelled";
        if (!hasConfirmed && !started)
        {
            _db.Payments.RemoveRange(enrollment.Payments);
            _db.Enrollments.Remove(enrollment);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return EnrollmentResult.Ok(byStudent ? "Đã hủy đăng ký" : "Đã rút học viên khỏi lớp");
        }

        enrollment.Status = "Dropped";
        foreach (var p in enrollment.Payments.Where(p => p.Status == "Pending"))
        {
            p.Status = "Rejected";
            p.CancelReason = "Học viên đã nghỉ lớp";
        }
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        return EnrollmentResult.Ok(hasConfirmed
            ? "Đã chuyển ghi danh sang Nghỉ (Dropped). Nếu hoàn tiền, lập phiếu hoàn ở trang Học phí"
            : "Lớp đã khai giảng nên ghi danh được chuyển sang Nghỉ (Dropped) để giữ lịch sử học");
    }

    // Cảnh báo khi Admin đổi lịch/ngày của lớp: học viên trong lớp bị trùng với lớp khác đang học
    public async Task<List<string>> StudentConflictsForScheduleAsync(int classId, DateOnly start, DateOnly end,
        IEnumerable<ClassCalendar.Slot> newSlots)
    {
        var slots = newSlots.ToList();
        var today = AppTime.Today;
        var studentIds = await _db.Enrollments.AsNoTracking()
            .Where(e => e.ClassId == classId && e.Status == "Active").Select(e => e.StudentId).ToListAsync();
        if (studentIds.Count == 0) return new List<string>();

        var others = await _db.Enrollments.AsNoTracking()
            .Where(e => studentIds.Contains(e.StudentId) && e.ClassId != classId && e.Status == "Active" && e.Class.EndDate >= today)
            .Select(e => new
            {
                e.Student.Code, StudentName = e.Student.FullName, ClassName = e.Class.Name,
                e.Class.StartDate, e.Class.EndDate,
                Slots = e.Class.Schedules.Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime }).ToList()
            })
            .ToListAsync();

        var result = new List<string>();
        foreach (var o in others)
        {
            var oSlots = o.Slots.Select(s => new ClassCalendar.Slot(s.DayOfWeek, s.StartTime, s.EndTime)).ToList();
            if (ClassCalendar.Overlaps(start, end, slots, o.StartDate, o.EndDate, oSlots, out var clash))
                result.Add($"{o.Code} {o.StudentName} (lớp {o.ClassName}, {ClassCalendar.DayNameVi(clash!.DayOfWeek)} " +
                           $"{clash.StartTime:HH\\:mm}-{clash.EndTime:HH\\:mm})");
        }
        return result;
    }
}
