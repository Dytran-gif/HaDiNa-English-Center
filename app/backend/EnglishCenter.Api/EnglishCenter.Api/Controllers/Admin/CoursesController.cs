using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EnglishCenter.Api.Dtos.Common;
using Microsoft.Data.SqlClient;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/courses")]
[Authorize(Roles = "admin")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CoursesController(AppDbContext db)
    {
        _db = db;
    }

    private static DateOnly Today() => EnglishCenter.Api.Services.AppTime.Today;

    // Chuyển Course -> CourseResponse, kèm số lớp và số học viên (tính ngay trong SQL)
    private static IQueryable<CourseResponse> Project(IQueryable<Course> query, DateOnly today)
    {
        return query.Select(c => new CourseResponse
        {
            Id = c.Id,
            Code = c.Code,
            Slug = c.Slug,
            ImageUrl = c.ImageUrl,
            IsPublished = c.IsPublished,
            Name = c.Name,
            Description = c.Description,
            BandFrom = c.BandFrom,
            BandTo = c.BandTo,
            TotalSessions = c.TotalSessions,
            SessionsPerWeek = c.SessionsPerWeek,
            Tuition = c.Tuition,
            DiscountPercent = c.DiscountPercent,
            OpenClasses = c.Classes.Count(x => x.EndDate >= today),
            ActiveStudents = c.Classes
                .Where(x => x.EndDate >= today)
                .SelectMany(x => x.Enrollments)
                .Count(e => e.Status == "Active")
        });
    }

    // Mã + slug: lấy từ request hoặc tự sinh từ tên; trả lỗi nếu trùng khóa khác
    private async Task<(string code, string slug, object? error)> ResolveCodesAsync(CourseRequest req, int? id)
    {
        var name = req.Name.Trim();
        string code;
        if (!string.IsNullOrWhiteSpace(req.Code))
        {
            code = Codes.NormalizeCourseCode(req.Code);
            if (code.Length < 2) return ("", "", new { message = "Mã khóa tối thiểu 2 ký tự chữ/số", errors = new { code = new[] { "Mã khóa tối thiểu 2 ký tự chữ/số" } } });
            if (await _db.Courses.AnyAsync(c => c.Code == code && c.Id != (id ?? 0)))
                return ("", "", new { message = $"Mã khóa {code} đã được dùng", errors = new { code = new[] { "Mã khóa đã được dùng" } } });
        }
        else
        {
            var words = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var baseCode = Codes.NormalizeCourseCode(
                new string((words.FirstOrDefault() ?? "KH").Where(char.IsLetter).Take(2).ToArray())
                + new string(name.Where(char.IsAsciiDigit).Take(4).ToArray()));
            if (baseCode.Length < 2) baseCode = "KH";
            code = baseCode;
            for (var i = 2; await _db.Courses.AnyAsync(c => c.Code == code && c.Id != (id ?? 0)); i++)
                code = Codes.NormalizeCourseCode(baseCode[..Math.Min(baseCode.Length, 8)] + i);
        }

        var slug = Codes.Slugify(string.IsNullOrWhiteSpace(req.Slug) ? name : req.Slug);
        if (slug.Length == 0) slug = "khoa-hoc";
        if (!string.IsNullOrWhiteSpace(req.Slug))
        {
            if (await _db.Courses.AnyAsync(c => c.Slug == slug && c.Id != (id ?? 0)))
                return ("", "", new { message = "Đường dẫn đã được khóa khác dùng", errors = new { slug = new[] { "Đường dẫn đã được dùng" } } });
        }
        else
        {
            var baseSlug = slug;
            for (var i = 2; await _db.Courses.AnyAsync(c => c.Slug == slug && c.Id != (id ?? 0)); i++)
                slug = $"{baseSlug}-{i}";
        }
        return (code, slug, null);
    }

    // GET api/admin/courses?search=ielts&page=1&pageSize=16
    [HttpGet]
    public async Task<IActionResult> GetAll(string? search, int page = 1, int pageSize = 16)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 16;
        if (pageSize > 100) pageSize = 100;

        var query = _db.Courses.AsNoTracking().WhereContains(search, c => c.Name, c => c.Code);

        var total = await query.CountAsync();

        var items = await Project(query.OrderByDescending(c => c.CreatedAt).ThenBy(c => c.Id)
                .SlicePage(page, pageSize, total), Today())
            .ToListAsync();

        return Ok(new PagedResult<CourseResponse>
        {
            Items = items,
            TotalItems = total,
            Page = page,
            PageSize = pageSize
        });
    }

    // GET api/admin/courses/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var course = await Project(_db.Courses.Where(c => c.Id == id), Today()).FirstOrDefaultAsync();
        if (course == null)
            return NotFound(new { message = "Không tìm thấy khóa học" });

        return Ok(course);
    }

    // POST api/admin/courses
    [HttpPost]
    public async Task<IActionResult> Create(CourseRequest req)
    {
        var name = req.Name.Trim();

        if (await _db.Courses.AnyAsync(c => c.Name == name))
            return Conflict(new { message = "Tên khóa học đã tồn tại", errors = new { name = new[] { "Tên khóa học đã tồn tại" } } });

        var (code, slug, codeError) = await ResolveCodesAsync(req, null);
        if (codeError != null) return Conflict(codeError);

        var course = new Course
        {
            Code = code,
            Slug = slug,
            ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim(),
            IsPublished = req.IsPublished ?? true,
            Name = name,
            Description = req.Description?.Trim(),
            BandFrom = req.BandFrom,
            BandTo = req.BandTo,
            TotalSessions = req.TotalSessions,
            SessionsPerWeek = req.SessionsPerWeek,
            Tuition = req.Tuition,
            DiscountPercent = req.DiscountPercent
        };
        _db.Courses.Add(course);
        try { await _db.SaveChangesAsync(); }
        catch (DbUpdateException error) when (error.InnerException is SqlException { Number: 2601 or 2627 })
        {
            return Conflict(new { message = "Tên khóa học đã tồn tại", errors = new { name = new[] { "Tên khóa học đã tồn tại" } } });
        }

        var result = await Project(_db.Courses.Where(c => c.Id == course.Id), Today()).FirstAsync();
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, result);
    }

    // PUT api/admin/courses/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CourseRequest req)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { message = "Không tìm thấy khóa học" });

        var name = req.Name.Trim();

        if (await _db.Courses.AnyAsync(c => c.Name == name && c.Id != id))
            return Conflict(new { message = "Tên khóa học đã tồn tại", errors = new { name = new[] { "Tên khóa học đã tồn tại" } } });

        req.Code ??= course.Code;
        req.Slug ??= course.Slug;
        var (code, slug, codeError) = await ResolveCodesAsync(req, id);
        if (codeError != null) return Conflict(codeError);

        // Đổi học phí / giảm giá chỉ ảnh hưởng ghi danh MỚI,
        // vì các ghi danh cũ đã lưu snapshot giá trong bảng Enrollments.
        // Đổi mã khóa không đổi mã các lớp đã tạo.
        course.Code = code;
        course.Slug = slug;
        // Simplified Admin form omits website metadata; do not erase or republish existing courses.
        if (req.ImageUrlProvided)
            course.ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim();
        if (req.IsPublished.HasValue) course.IsPublished = req.IsPublished.Value;
        course.Name = name;
        course.Description = req.Description?.Trim();
        course.BandFrom = req.BandFrom;
        course.BandTo = req.BandTo;
        course.TotalSessions = req.TotalSessions;
        course.SessionsPerWeek = req.SessionsPerWeek;
        course.Tuition = req.Tuition;
        course.DiscountPercent = req.DiscountPercent;
        try { await _db.SaveChangesAsync(); }
        catch (DbUpdateException error) when (error.InnerException is SqlException { Number: 2601 or 2627 })
        {
            return Conflict(new { message = "Tên khóa học đã tồn tại", errors = new { name = new[] { "Tên khóa học đã tồn tại" } } });
        }

        var result = await Project(_db.Courses.Where(c => c.Id == id), Today()).FirstAsync();
        return Ok(result);
    }

    // DELETE api/admin/courses/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { message = "Không tìm thấy khóa học" });

        // Luật: khóa đã có lớp (kể cả lớp đã kết thúc) thì không được xóa
        var classCount = await _db.Classes.CountAsync(c => c.CourseId == id);
        if (classCount > 0)
            return Conflict(new { message = $"Khóa học đang được {classCount} lớp sử dụng, không thể xóa" });

        _db.Courses.Remove(course);
        try { await _db.SaveChangesAsync(); }
        catch (DbUpdateException error) when (error.InnerException is SqlException { Number: 547 })
        {
            return Conflict(new { message = "Khóa học vừa được sử dụng, không thể xóa. Hãy tải lại danh sách." });
        }

        return NoContent();
    }
}
