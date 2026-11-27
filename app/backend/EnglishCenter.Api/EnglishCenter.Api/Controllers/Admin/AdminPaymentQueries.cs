using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Entities;

namespace EnglishCenter.Api.Controllers.Admin;

internal static class AdminPaymentQueries
{
    internal static IQueryable<PaymentResponse> Project(IQueryable<Payment> query) =>
        query.Select(p => new PaymentResponse
        {
            Id = p.Id,
            EnrollmentId = p.EnrollmentId,
            StudentId = p.Enrollment.StudentId,
            StudentCode = p.Enrollment.Student.Code,
            StudentName = p.Enrollment.Student.FullName,
            ClassId = p.Enrollment.ClassId,
            ClassName = p.Enrollment.Class.Name,
            CourseName = p.Enrollment.Class.Course.Name,
            TuitionFee = p.Enrollment.TuitionFee,
            DiscountPercent = p.Enrollment.DiscountPercent,
            DiscountAmount = p.Enrollment.DiscountAmount,
            FinalTuitionFee = p.Enrollment.FinalTuitionFee,
            Amount = p.Amount,
            PaidDate = p.PaidDate,
            Method = p.Method,
            ReceiptNo = p.ReceiptNo,
            Kind = p.Kind,
            Status = p.Status,
            TransferRef = p.TransferRef,
            Note = p.Note,
            CancelReason = p.CancelReason,
            RequestedByStudent = p.CreatedByUser.Role == "student",
            CreatedAt = p.CreatedAt,
            ConfirmedAt = p.ConfirmedAt
        });

    // Công nợ theo ghi danh (đã thu = xác nhận - hoàn)
    internal static IQueryable<ReceivableResponse> Receivables(IQueryable<Enrollment> query) =>
        query.Select(e => new ReceivableResponse
        {
            EnrollmentId = e.Id,
            StudentId = e.StudentId,
            StudentCode = e.Student.Code,
            StudentName = e.Student.FullName,
            StudentPhone = e.Student.Phone,
            ClassId = e.ClassId,
            ClassName = e.Class.Name,
            CourseName = e.Class.Course.Name,
            EnrollmentStatus = e.Status,
            ClassStartDate = e.Class.StartDate,
            FinalTuitionFee = e.FinalTuitionFee,
            PaidAmount = e.Payments.Where(p => p.Status == "Confirmed" && p.Kind == "Payment").Sum(p => (decimal?)p.Amount) ?? 0,
            RefundedAmount = e.Payments.Where(p => p.Status == "Confirmed" && p.Kind == "Refund").Sum(p => (decimal?)p.Amount) ?? 0,
            PendingAmount = e.Payments.Where(p => p.Status == "Pending").Sum(p => (decimal?)p.Amount) ?? 0
        });
}
