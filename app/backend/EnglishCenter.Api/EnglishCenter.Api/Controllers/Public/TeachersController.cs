using System.Text.Json;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Public;

[ApiController]
[AllowAnonymous]
[Route("api/public/teachers")]
public class TeachersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var profiles = await db.PublicTeacherProfiles.AsNoTracking().Where(x => x.IsPublished).OrderBy(x => x.Id).ToListAsync(ct);
        return Ok(profiles.Select(ToResponse));
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> Detail(string slug, CancellationToken ct)
    {
        var profile = await db.PublicTeacherProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == slug && x.IsPublished, ct);
        return profile == null ? NotFound(new { message = "Không tìm thấy hồ sơ giáo viên." }) : Ok(ToResponse(profile));
    }

    private static object ToResponse(PublicTeacherProfile p) => new
    {
        teacher_id = p.Id, slug = p.Slug, full_name = p.FullName, title = p.Title, bio = p.Bio,
        credentials = JsonSerializer.Deserialize<string[]>(p.CredentialsJson) ?? [],
        initials = string.Concat(p.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).TakeLast(2).Select(x => x[0])),
        avatar = p.AvatarUrl
    };
}
