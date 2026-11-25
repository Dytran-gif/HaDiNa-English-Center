using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.Admin;
using EnglishCenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController, Authorize(Roles = "admin"), Route("api/admin/profile")]
public class ProfileController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return user == null ? NotFound(new { message = "Không tìm thấy tài khoản." }) : Ok(ToResponse(user));
    }

    [HttpPut]
    public async Task<IActionResult> Update(AdminProfileInput input, CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });
        user.FullName = input.FullName.Trim();
        user.Phone = string.IsNullOrWhiteSpace(input.Phone) ? null : input.Phone.Trim();
        await db.SaveChangesAsync(ct);
        return Ok(ToResponse(user));
    }

    private static object ToResponse(User u) => new { userId = u.Id, u.FullName, u.Phone, u.Email, u.Role };
}
