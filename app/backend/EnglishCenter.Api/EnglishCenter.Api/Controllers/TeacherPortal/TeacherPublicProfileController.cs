using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Hồ sơ giới thiệu trên website (bảng PublicTeacherProfiles, gắn TeacherId) + đánh giá học viên về mình.
// Trang /giao-vien của website đọc đúng hồ sơ này: tên, ảnh lấy từ tài khoản giáo viên, khóa phụ trách lấy từ lớp thật.
[Route("api/teacher")]
public class TeacherPublicProfileController : TeacherControllerBase
{
    public TeacherPublicProfileController(AppDbContext db) : base(db) { }

    public class PublicProfileRequest
    {
        [Required(ErrorMessage = "Nhập chức danh / chuyên môn hiển thị")]
        [StringLength(300, ErrorMessage = "Tối đa 300 ký tự")]
        public string Title { get; set; } = "";

        [Required(ErrorMessage = "Nhập phần giới thiệu")]
        [StringLength(4000, MinimumLength = 20, ErrorMessage = "Giới thiệu từ 20 đến 4000 ký tự")]
        public string Bio { get; set; } = "";

        [MaxLength(20, ErrorMessage = "Tối đa 20 bằng cấp")]
        public List<string> Credentials { get; set; } = new();

        public bool IsPublished { get; set; }
    }

    // GET api/teacher/profile/public - hồ sơ website của mình (chưa có thì trả bản nháp gợi ý)
    [HttpGet("profile/public")]
    public async Task<IActionResult> GetPublic()
    {
        var t = await Db.Teachers.AsNoTracking().Where(x => x.Id == TeacherId)
            .Select(x => new { x.FullName, x.Specialty, x.Degree, x.User.AvatarUrl }).FirstAsync();
        var p = await Db.PublicTeacherProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.TeacherId == TeacherId);
        var courses = await MyClasses.Select(c => c.Course.Name).Distinct().OrderBy(n => n).ToListAsync();

        return Ok(new
        {
            Exists = p != null,
            Slug = p?.Slug,
            FullName = t.FullName,
            AvatarUrl = t.AvatarUrl ?? p?.AvatarUrl,
            Title = p?.Title ?? t.Specialty,
            Bio = p?.Bio ?? "",
            Credentials = p != null ? ParseCredentials(p.CredentialsJson)
                : (string.IsNullOrWhiteSpace(t.Degree) ? new List<string>() : new List<string> { t.Degree! }),
            IsPublished = p?.IsPublished ?? false,
            Courses = courses
        });
    }

    // PUT api/teacher/profile/public - lưu hồ sơ website (tạo mới nếu chưa có)
    [HttpPut("profile/public")]
    public async Task<IActionResult> SavePublic(PublicProfileRequest req)
    {
        var t = await Db.Teachers.Include(x => x.User).FirstAsync(x => x.Id == TeacherId);
        var p = await Db.PublicTeacherProfiles.FirstOrDefaultAsync(x => x.TeacherId == TeacherId);
        if (p == null)
        {
            var baseSlug = Codes.Slugify(t.FullName);
            if (baseSlug.Length == 0) baseSlug = "giao-vien";
            var slug = baseSlug;
            for (var i = 2; await Db.PublicTeacherProfiles.AnyAsync(x => x.Slug == slug); i++) slug = $"{baseSlug}-{i}";
            p = new PublicTeacherProfile { TeacherId = TeacherId, Slug = slug };
            Db.PublicTeacherProfiles.Add(p);
        }
        p.FullName = t.FullName;
        p.AvatarUrl = t.User.AvatarUrl ?? p.AvatarUrl;
        p.Title = req.Title.Trim();
        p.Bio = req.Bio.Trim();
        p.CredentialsJson = JsonSerializer.Serialize(req.Credentials
            .Select(c => c.Trim()).Where(c => c.Length > 0).Select(c => c.Length > 200 ? c[..200] : c).ToList());
        p.IsPublished = req.IsPublished;
        await Db.SaveChangesAsync();
        return Ok(new { message = req.IsPublished ? "Đã lưu và hiển thị trên website" : "Đã lưu (đang ẩn khỏi website)", p.Slug });
    }

    // GET api/teacher/reviews - đánh giá của học viên về mình (đã duyệt + chờ duyệt)
    [HttpGet("reviews")]
    public async Task<IActionResult> Reviews()
    {
        var rows = await Db.TeacherReviews.AsNoTracking().Where(r => r.TeacherId == TeacherId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new { r.Id, r.Rating, r.Comment, r.IsPublished, r.CreatedAt, StudentName = r.Student.FullName, ClassName = r.Class.Name })
            .ToListAsync();
        return Ok(new
        {
            Average = rows.Count == 0 ? 0 : Math.Round(rows.Average(r => r.Rating), 1),
            Count = rows.Count,
            Items = rows.Select(r => new
            {
                r.Id, r.Rating, r.Comment, r.IsPublished, r.CreatedAt, r.ClassName,
                StudentName = Codes.ShortName(r.StudentName)
            })
        });
    }

    internal static List<string> ParseCredentials(string json)
    {
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>(); }
        catch (JsonException) { return new List<string>(); }
    }
}
