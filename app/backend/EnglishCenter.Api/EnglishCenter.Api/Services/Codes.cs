using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using EnglishCenter.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Services;

// Shared course codes/slugs, receipt numbers and display-name helpers.
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
