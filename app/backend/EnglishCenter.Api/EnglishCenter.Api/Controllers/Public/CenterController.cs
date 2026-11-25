using EnglishCenter.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Public;

[ApiController, AllowAnonymous, Route("api/public/center")]
public class CenterController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        Response.Headers.CacheControl = "no-store";
        var center = await db.CenterSettings.AsNoTracking().Where(c => c.Id == 1)
            .Select(c => new { c.Name, c.LogoUrl, c.Address, c.Phone }).FirstOrDefaultAsync(ct);
        return center == null ? NotFound(new { message = "Chưa có thông tin trung tâm." }) : Ok(center);
    }
}
