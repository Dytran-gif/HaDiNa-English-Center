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
            Amount = p.Amount,
            PaidDate = p.PaidDate,
            Method = p.Method
        });
}
