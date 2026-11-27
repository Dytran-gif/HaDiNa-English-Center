using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Ghi danh của học viên: "Khóa của tôi" (Đang học / Sắp học / Đã học), đăng ký theo LỚP, hủy đăng ký.
// Đăng ký dùng chung EnrollmentService với Admin: lớp chưa kết thúc, còn chỗ, không trùng lịch, không học trùng khóa.
[Route("api/student/enrollments")]
public class EnrollmentsController : StudentControllerBase
{
    private readonly EnrollmentService _enrollments;

    public EnrollmentsController(AppDbContext db, EnrollmentService enrollments) : base(db)
    {
        _enrollments = enrollments;
    }

    internal static StudentEnrollmentItemDto ToDto(MyEnrollment e, DateOnly today)
    {
        var balance = e.Balance;
        var lastPaid = e.Payments.Where(p => p.Status == PaymentService.Confirmed && p.Kind == PaymentService.KindPayment)
            .OrderByDescending(p => p.Id).FirstOrDefault();
        var classStatus = e.ClassStatus(today);
        return new StudentEnrollmentItemDto
        {
            EnrollmentId = e.EnrollmentId,
            Status = e.Status,
            TuitionFee = e.TuitionFee,
            DiscountPercent = e.DiscountPercent,
            DiscountAmount = e.DiscountAmount,
            ExtraDiscountAmount = e.ExtraDiscountAmount,
            DiscountNote = e.DiscountNote,
            FinalTuitionFee = e.FinalTuitionFee,
            ClassId = e.ClassId,
            ClassName = e.ClassName,
            ClassStatus = classStatus,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            TeacherName = e.TeacherName,
            ScheduleText = e.ScheduleText,
            SessionsDone = e.DoneSessions(today),
            ClassTotalSessions = e.TotalSessions,
            CanCancel = e.Status == "Active" && e.StartDate > today && balance.Net <= 0,
            IsPaid = balance.Remaining == 0,
            PaidAmount = balance.Net > 0 ? balance.Net : null,
            PendingAmount = balance.Pending,
            RemainingAmount = balance.Remaining,
            PaymentStatus = balance.Status,
            PaidDate = lastPaid?.PaidDate,
            Method = lastPaid?.Method,
            Course = new CourseItemDto
            {
                Id = e.CourseId.ToString(),
                Name = e.CourseName,
                Description = e.Description ?? "",
                BandFrom = e.BandFrom.ToString("0.#"),
                BandTo = e.BandTo.ToString("0.#"),
                TotalSessions = e.CourseTotalSessions,
                SessionsPerWeek = e.SessionsPerWeek,
                Tuition = e.Tuition,
                DiscountPercent = e.CourseDiscountPercent,
                ImageUrl = e.ImageUrl,
                TeacherName = e.TeacherName,
                ClassId = e.ClassId,
                ClassName = e.ClassName,
                ClassStatus = classStatus,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                SessionsDone = e.DoneSessions(today),
                ClassTotalSessions = e.TotalSessions
            }
        };
    }

    // GET api/student/enrollments - mọi ghi danh của mình (FE chia tab theo classStatus / status)
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var today = AppTime.Today;
        var rows = await LoadMyEnrollmentsAsync();
        return Ok(rows.OrderByDescending(r => r.StartDate).Select(r => ToDto(r, today)).ToList());
    }

    // Legacy self-enrollment is disabled; students submit course requests for Admin assignment.
    [HttpPost]
    public IActionResult Create(StudentEnrollRequest req)
    {
        return Error(403, "Học viên đăng ký khóa học tại course-registrations; Admin sẽ xếp lớp phù hợp");
    }

    // DELETE api/student/enrollments/{enrollmentId} - hủy đăng ký của chính mình.
    // Chỉ khi lớp chưa khai giảng và chưa có khoản đã đóng; ngược lại liên hệ trung tâm.
    [HttpDelete("{enrollmentId:int}")]
    public async Task<IActionResult> Delete(int enrollmentId)
    {
        var result = await _enrollments.WithdrawAsync(StudentId, enrollmentId, byStudent: true);
        if (!result.Success) return Error(result.StatusCode, result.Message);
        return Ok(new { message = result.Message });
    }
}
