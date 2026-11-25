using EnglishCenter.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

[ApiController, Authorize(Roles = "admin"), Route("api/admin/consultations")]
public class ConsultationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, int page = 1, int pageSize = 10, CancellationToken ct = default)
    {
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
        if (search?.Length > 200) return BadRequest(new { message = "Từ khóa tối đa 200 ký tự." });
        var query = db.ConsultationRequests.AsNoTracking().WhereContains(search, x => x.FullName, x => x.Phone, x => x.Email, x => x.CourseName);
        var total = await query.CountAsync(ct);
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));
        page = Math.Min(page, totalPages);
        var items = await query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => new { x.Id, x.FullName, x.Phone, x.Email, x.CourseName, x.CreatedAt }).ToListAsync(ct);
        return Ok(new { items, total, page, pageSize, totalPages });
    }
}
