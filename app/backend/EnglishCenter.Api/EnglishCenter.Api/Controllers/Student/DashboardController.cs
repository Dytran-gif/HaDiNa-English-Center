using EnglishCenter.Api.Data;
using EnglishCenter.Api.Services.StudentPortal;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers.StudentPortal;

// API Dashboard học viên: tổng hợp số liệu học tập, buổi học, bài tập và thông báo
[Route("api/student/dashboard")]
public class DashboardController : StudentControllerBase
{
    private readonly StudentDashboardService _dashboardService;

    public DashboardController(AppDbContext db, StudentDashboardService dashboardService) : base(db)
    {
        _dashboardService = dashboardService;
    }

    // GET api/student/dashboard
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _dashboardService.GetDashboardAsync(UserId, StudentId);
        return Ok(data);
    }
}
