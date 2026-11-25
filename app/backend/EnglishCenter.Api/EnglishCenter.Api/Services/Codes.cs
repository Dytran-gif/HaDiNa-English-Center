using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using EnglishCenter.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

// Sinh mã/đường dẫn dùng chung: slug, mã lớp, số biên lai, tên viết tắt.
public static class Codes
{
    // "IELTS 5.0 – 6.5 Cấp tốc" -> "ielts-5-0-6-5-cap-toc"
    public static string Slugify(string text)
    {
        var normalized = text.Trim().ToLowerInvariant().Replace('đ', 'd').Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in normalized)
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark) sb.Append(ch);
        var slug = NonSlugChars.Replace(sb.ToString(), "-").Trim('-');
        return slug.Length > 150 ? slug[..150].Trim('-') : slug;
    }

    // Mã khóa: chữ in hoa + số, tối đa 10 ký tự
    public static string NormalizeCourseCode(string code) =>
        new string(code.Trim().ToUpperInvariant().Where(char.IsAsciiLetterOrDigit).Take(10).ToArray());

    // Mã lớp: chữ, số, dấu gạch; in hoa; tối đa 20 ký tự
    public static string NormalizeClassCode(string code) =>
        new string(code.Trim().ToUpperInvariant().Where(c => char.IsAsciiLetterOrDigit(c) || c == '-').Take(20).ToArray());

    // Mã lớp tự sinh: <mã khóa>-<YYMM khai giảng>-<A..Z, rồi 27, 28...> (chọn hậu tố chưa dùng)
    public static async Task<string> NextClassCodeAsync(AppDbContext db, int courseId, DateOnly startDate, int? excludeClassId = null)
    {
        var courseCode = await db.Courses.Where(c => c.Id == courseId).Select(c => c.Code).FirstOrDefaultAsync() ?? "LOP";
        var prefix = $"{courseCode}-{startDate:yyMM}-";
        var used = (await db.Classes.AsNoTracking()
                .Where(c => c.Code.StartsWith(prefix) && c.Id != (excludeClassId ?? 0))
                .Select(c => c.Code).ToListAsync())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        for (var i = 1; ; i++)
        {
            var code = prefix + (i <= 26 ? ((char)('A' + i - 1)).ToString() : i.ToString(CultureInfo.InvariantCulture));
            if (!used.Contains(code)) return code;
        }
    }

    // Số biên lai: PT-YYMM-0001 theo tháng ghi nhận
    public static async Task<string> NextReceiptNoAsync(AppDbContext db, DateOnly date)
    {
        var prefix = $"PT-{date:yyMM}-";
        var last = await db.Payments.AsNoTracking()
            .Where(p => p.ReceiptNo != null && p.ReceiptNo.StartsWith(prefix))
            .Select(p => p.ReceiptNo!)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync();
        var next = last != null && int.TryParse(last[prefix.Length..], out var n) ? n + 1 : 1;
        return prefix + next.ToString("0000", CultureInfo.InvariantCulture);
    }

    // "Nguyễn Văn An" -> "Nguyễn V. A." (hiện tên người đánh giá ở trang public)
    public static string ShortName(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length <= 1) return fullName.Trim();
        return parts[0] + " " + string.Join(" ", parts.Skip(1).Select(p => char.ToUpper(p[0]) + "."));
    }

    // "Nguyễn Văn An" -> "NA" (ảnh đại diện chữ cái)
    public static string Initials(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "";
        return parts.Length == 1 ? parts[0][..1].ToUpper() : (parts[0][..1] + parts[^1][..1]).ToUpper();
    }

    private static readonly Regex NonSlugChars = new("[^a-z0-9]+", RegexOptions.Compiled);
}
