using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Dtos.Common;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/students")]
[Authorize(Roles = "admin")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EnrollmentService _enrollments;

    public StudentsController(AppDbContext db, EnrollmentService enrollments)
    {
        _db = db;
        _enrollments = enrollments;
    }

    private static DateOnly Today() => AppTime.Today;

    private static IQueryable<StudentResponse> Project(IQueryable<Student> query, DateOnly today)
    {
        return query.Select(s => new StudentResponse
        {
            Id = s.Id,
            UserId = s.UserId,
            Code = s.Code,
            FullName = s.FullName,
            DateOfBirth = s.DateOfBirth,
            Phone = s.Phone,
            Email = s.User.Email,
            Address = s.Address,
            ParentName = s.ParentName,
            ParentPhone = s.ParentPhone,
            Status = s.Status,
            IsLocked = s.User.IsLocked,
            CreatedAt = s.CreatedAt,
            CurrentClass = s.Enrollments
                .Where(e => e.Status == "Active" && e.Class.EndDate >= today)
                .OrderBy(e => e.Class.StartDate)
                .Select(e => e.Class.Name)
                .FirstOrDefault()
        });
    }


    // Lấy chi tiết học viên kèm danh sách ghi danh và phiếu thu
    private async Task<StudentResponse?> BuildDetail(int id)
    {
        var today = Today();

        var student = await Project(_db.Students.Where(s => s.Id == id && s.DeletedAt == null), today).FirstOrDefaultAsync();
        if (student == null) return null;

        var items = await _db.Enrollments
            .Where(e => e.StudentId == id)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new StudentEnrollmentItem
            {
                Id = e.Id,
                ClassId = e.ClassId,
                ClassName = e.Class.Name,
                CourseName = e.Class.Course.Name,
                ClassStartDate = e.Class.StartDate,
                ClassEndDate = e.Class.EndDate,
                TuitionFee = e.TuitionFee,
                DiscountPercent = e.DiscountPercent,
                DiscountAmount = e.DiscountAmount,
                ExtraDiscountAmount = e.ExtraDiscountAmount,
                DiscountNote = e.DiscountNote,
                FinalTuitionFee = e.FinalTuitionFee,
                Status = e.Status,
                PaidAmount = e.Payments.Where(p => p.Status == "Confirmed" && p.Kind == "Payment").Sum(p => (decimal?)p.Amount) ?? 0,
                RefundedAmount = e.Payments.Where(p => p.Status == "Confirmed" && p.Kind == "Refund").Sum(p => (decimal?)p.Amount) ?? 0,
                PendingAmount = e.Payments.Where(p => p.Status == "Pending").Sum(p => (decimal?)p.Amount) ?? 0,
                PaymentId = e.Payments.Where(p => p.Status == "Confirmed" && p.Kind == "Payment")
                    .OrderByDescending(p => p.Id).Select(p => (int?)p.Id).FirstOrDefault(),
                PaidDate = e.Payments.Where(p => p.Status == "Confirmed" && p.Kind == "Payment")
                    .OrderByDescending(p => p.Id).Select(p => (DateOnly?)p.PaidDate).FirstOrDefault(),
                PaymentMethod = e.Payments.Where(p => p.Status == "Confirmed" && p.Kind == "Payment")
                    .OrderByDescending(p => p.Id).Select(p => p.Method).FirstOrDefault()
            })
            .ToListAsync();

        foreach (var item in items)
        {
            item.ClassStatus = ClassCalendar.Status(item.ClassStartDate, item.ClassEndDate, today);
            var balance = new TuitionBalance(item.FinalTuitionFee, item.PaidAmount, item.RefundedAmount, item.PendingAmount);
            item.RemainingAmount = balance.Remaining;
            item.PaymentStatus = balance.Status;
        }

        student.Enrollments = items;
        return student;
    }

    // Sinh mã học viên tiếp theo: HV0001, HV0002, ...
    private Task<string> NextCode() => StudentCodeGenerator.NextAsync(_db);

    private Task<Student?> GetWithUser(int id)
    {
        return _db.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null);
    }

    // GET api/admin/students?search=&status=&page=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetAll(string? search, string? status, int page = 1, int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        if (!string.IsNullOrWhiteSpace(status) && status != "Studying" && status != "OnHold" && status != "Dropped")
            return BadRequest(new { message = "status phải là Studying, OnHold hoặc Dropped" });
        var query = _db.Students.AsNoTracking().Where(s => s.DeletedAt == null).WhereContains(search, s => s.FullName, s => s.Phone, s => s.Code);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        var total = await query.CountAsync();

        var items = await Project(query.OrderBy(s => s.Code)
                .SlicePage(page, pageSize, total), Today())
            .ToListAsync();

        return Ok(new PagedResult<StudentResponse>
        {
            Items = items,
            TotalItems = total,
            Page = page,
            PageSize = pageSize
        });
    }

    // GET api/admin/students/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await BuildDetail(id);
        if (student == null)
            return NotFound(new { message = "Không tìm thấy học viên" });

        return Ok(student);
    }

    [HttpGet("{id:int}/payments")]
    public async Task<IActionResult> GetPaymentsAsync(int id)
    {
        if (!await _db.Students.AnyAsync(s => s.Id == id))
            return NotFound(new { message = "Không tìm thấy học viên" });

        var items = await AdminPaymentQueries.Project(_db.Payments.AsNoTracking()
            .Where(p => p.Enrollment.StudentId == id)
            .OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)).ToListAsync();

        return Ok(new StudentPaymentsResponse
        {
            Items = items,
            TotalPaid = items.Where(p => p.Status == PaymentService.Confirmed && p.Kind == PaymentService.KindPayment).Sum(p => p.Amount)
                - items.Where(p => p.Status == PaymentService.Confirmed && p.Kind == PaymentService.KindRefund).Sum(p => p.Amount)
        });
    }

    // POST api/admin/students
    [HttpPost]
    public async Task<IActionResult> Create(StudentCreateRequest req)
    {
        var email = req.Email.Trim();

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email đã được sử dụng" });

        // User + Student lưu trong cùng một SaveChanges (một transaction)
        var student = new Student
        {
            Code = await NextCode(),
            FullName = req.FullName.Trim(),
            DateOfBirth = req.DateOfBirth,
            Phone = req.Phone.Trim(),
            Address = req.Address?.Trim(),
            ParentName = req.ParentName?.Trim(),
            ParentPhone = req.ParentPhone?.Trim(),
            Status = req.Status,
            User = new User
            {
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.TempPassword),
                Role = "student"
            }
        };
        _db.Students.Add(student);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Không thể tạo học viên (trùng email hoặc mã), vui lòng thử lại" });
        }

        var result = await Project(_db.Students.Where(s => s.Id == student.Id), Today()).FirstAsync();
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, result);
    }

    // PUT api/admin/students/5 (không sửa mã, không sửa email)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, StudentUpdateRequest req)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        await StudentLifecycle.LockAsync(_db, id);
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null);
        if (student == null)
            return NotFound(new { message = "Không tìm thấy học viên" });

        student.FullName = req.FullName.Trim();
        student.DateOfBirth = req.DateOfBirth;
        student.Phone = req.Phone.Trim();
        student.Address = req.Address?.Trim();
        student.ParentName = req.ParentName?.Trim();
        student.ParentPhone = req.ParentPhone?.Trim();
        student.Status = req.Status;
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        var result = await Project(_db.Students.Where(s => s.Id == id), Today()).FirstAsync();
        return Ok(result);
    }

    // DELETE api/admin/students/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        // Serialize deletion with enrollment/status changes; counts read Active enrollments.
        await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        await StudentLifecycle.LockAsync(_db, id);
        var student = await GetWithUser(id);
        if (student == null)
            return NotFound(new { message = "Không tìm thấy học viên" });

        if (!student.User.IsLocked && student.Status != "Dropped")
            return Conflict(new { message = "Chỉ được xóa học viên đã khóa tài khoản hoặc có trạng thái Nghỉ học." });

        var enrollments = await _db.Enrollments.Where(e => e.StudentId == id).ToListAsync();
        foreach (var enrollment in enrollments) enrollment.Status = "Dropped";
        var pending = await _db.Payments.Where(p => p.Enrollment.StudentId == id && p.Status == "Pending").ToListAsync();
        foreach (var payment in pending)
        {
            payment.Status = "Rejected";
            payment.CancelReason = "Học viên đã được xóa khỏi danh sách";
        }
        student.Status = "Dropped";
        student.DeletedAt = AppTime.Now;
        student.User.IsLocked = true;
        student.User.TokenVersion++;
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return NoContent();
    }

    // POST api/admin/students/5/reset-password
    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, ResetPasswordRequest req)
    {
        var student = await GetWithUser(id);
        if (student == null)
            return NotFound(new { message = "Không tìm thấy học viên" });

        student.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        student.User.TokenVersion++;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đặt lại mật khẩu thành công" });
    }

    // POST api/admin/students/5/lock
    [HttpPost("{id}/lock")]
    public async Task<IActionResult> Lock(int id)
    {
        var student = await GetWithUser(id);
        if (student == null)
            return NotFound(new { message = "Không tìm thấy học viên" });

        student.User.IsLocked = true;
        student.User.TokenVersion++;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã khóa tài khoản" });
    }

    // POST api/admin/students/5/unlock
    [HttpPost("{id}/unlock")]
    public async Task<IActionResult> Unlock(int id)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        await StudentLifecycle.LockAsync(_db, id);
        var changed = await _db.Users.Where(u => u.Student != null && u.Student.Id == id && u.Student.DeletedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.IsLocked, false));
        if (changed == 0)
            return NotFound(new { message = "Không tìm thấy học viên" });
        await tx.CommitAsync();

        return Ok(new { message = "Đã mở khóa tài khoản" });
    }

    // POST api/admin/students/5/enrollments  { "classId": 1 }
    [HttpPost("{id}/enrollments")]
    public async Task<IActionResult> Enroll(int id, EnrollRequest req)
    {
        if (req.ExtraDiscountAmount > 0 && string.IsNullOrWhiteSpace(req.DiscountNote))
            return BadRequest(new { message = "Nhập lý do khi có ưu đãi riêng", errors = new { discountNote = new[] { "Nhập lý do ưu đãi" } } });
        var result = await _enrollments.EnrollAsync(id, req.ClassId,
            new EnrollOptions(req.ExtraDiscountAmount, req.DiscountNote, req.ProrateRemaining));
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        var detail = await BuildDetail(id);
        return StatusCode(StatusCodes.Status201Created, detail);
    }

    // DELETE api/admin/students/5/enrollments/12
    [HttpDelete("{id}/enrollments/{enrollmentId}")]
    public async Task<IActionResult> Withdraw(int id, int enrollmentId)
    {
        var result = await _enrollments.WithdrawAsync(id, enrollmentId);
        if (!result.Success)
            return StatusCode(result.StatusCode, new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}
