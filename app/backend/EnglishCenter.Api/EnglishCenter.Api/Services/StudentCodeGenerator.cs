using EnglishCenter.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

public static class StudentCodeGenerator
{
    public static async Task<string> NextAsync(AppDbContext db, CancellationToken ct = default)
    {
        var codes = await db.Students.AsNoTracking().Select(s => s.Code).ToListAsync(ct);
        long max = 0;
        foreach (var code in codes)
            if (code.StartsWith("HV", StringComparison.Ordinal) && long.TryParse(code.AsSpan(2), out var value))
                max = Math.Max(max, value);
        return $"HV{checked(max + 1):D4}";
    }
}
