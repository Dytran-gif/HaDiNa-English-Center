using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "admin")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis(CancellationToken cancellationToken)
    {
        var today = AppTime.Today;
        var start = new DateOnly(today.Year, today.Month, 1);
        var end = start.AddMonths(1);
        var students = await db.Students.CountAsync(s => s.Status == "Studying", cancellationToken);
        // Same definition as courses: upcoming and ongoing, excluding ended classes.
        var classes = await db.Classes.CountAsync(c => c.EndDate >= today, cancellationToken);
        var teachers = await db.Teachers.CountAsync(cancellationToken);
        var monthly = await db.Payments.Where(p => p.PaidDate >= start && p.PaidDate < end)
            .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;
        var total = await db.Payments.SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;
        return Ok(new DashboardKpisResponse(students, classes, teachers, monthly, total));
    }

    internal static IQueryable<RevenueBucket> RevenueQuery(AppDbContext context, DateOnly start, DateOnly end) =>
        context.Payments.AsNoTracking().Where(p => p.PaidDate >= start && p.PaidDate < end)
            .GroupBy(p => new { p.PaidDate.Year, p.PaidDate.Month })
            .Select(group => new RevenueBucket(group.Key.Year, group.Key.Month, group.Sum(p => p.Amount)));

    internal static RevenueMonthResponse[] FillMonths(DateOnly start, int months, IEnumerable<RevenueBucket> buckets)
    {
        var totals = buckets.ToDictionary(bucket => (bucket.Year, bucket.Month), bucket => bucket.Revenue);
        return Enumerable.Range(0, months).Select(offset =>
        {
            var month = start.AddMonths(offset);
            return new RevenueMonthResponse(month.ToString("yyyy-MM"), totals.GetValueOrDefault((month.Year, month.Month)));
        }).ToArray();
    }

    [HttpGet("revenue-by-month")]
    public async Task<IActionResult> GetRevenue(int months = 12, CancellationToken cancellationToken = default)
    {
        if (months < 1 || months > 36)
            return BadRequest(new { message = "months phải từ 1 đến 36" });
        var today = AppTime.Today;
        var end = new DateOnly(today.Year, today.Month, 1).AddMonths(1);
        var start = end.AddMonths(-months);
        var buckets = await RevenueQuery(db, start, end).ToListAsync(cancellationToken);
        return Ok(FillMonths(start, months, buckets));
    }
}
