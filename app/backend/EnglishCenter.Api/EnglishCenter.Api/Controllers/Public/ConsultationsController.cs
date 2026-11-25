using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Public;

[ApiController, AllowAnonymous, Route("api/public/consultations")]
public class ConsultationsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(ConsultationInput input, CancellationToken ct)
    {
        // Retry of the same submission is acknowledged without returning personal data.
        if (await db.ConsultationRequests.AnyAsync(x => x.SubmissionId == input.SubmissionId, ct))
            return Ok(new { message = "Đã nhận yêu cầu tư vấn." });
        db.ConsultationRequests.Add(new ConsultationRequest
        {
            SubmissionId = input.SubmissionId, FullName = input.FullName.Trim(), Phone = input.Phone.Trim(),
            Email = input.Email.Trim(), CourseSlug = input.CourseSlug.Trim(), CourseName = input.CourseName.Trim(), CreatedAt = AppTime.Now
        });
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2601 or 2627 })
        { return Ok(new { message = "Đã nhận yêu cầu tư vấn." }); }
        return StatusCode(201, new { message = "Đã nhận yêu cầu tư vấn." });
    }
}
