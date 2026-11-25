using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Điểm danh của học viên trong một lớp (tab Điểm danh của popup khóa học). 10 buổi/trang, mới nhất trước.
[Route("api/student/attendance")]
public class AttendanceController : StudentControllerBase
{
    private const int PageSize = 10;

    public AttendanceController(AppDbContext db) : base(db) { }

    // GET api/student/attendance?classId=5&page=1 (hoặc ?courseId= cho FE cũ -> lớp của mình trong khóa)
    // Chỉ điểm danh của chính mình, trong đúng lớp mình học (không gộp các lớp khác cùng khóa).
    [HttpGet]
    public async Task<IActionResult> GetPage(int? classId, int? courseId, int page = 1)
    {
        var my = await ResolveMyClassAsync(classId, courseId);
        if (my == null) return Error(403, "Bạn không thuộc lớp/khóa học này");

        if (page < 1) page = 1;

        var query = Db.Attendances.AsNoTracking()
            .Where(a => a.StudentId == StudentId && a.ClassId == my.ClassId);

        var total = await query.CountAsync();

        var counts = await query
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var rows = await query
            .OrderByDescending(a => a.Date).ThenByDescending(a => a.Id)
            .Skip((page - 1) * PageSize).Take(PageSize)
            .Select(a => new { a.Id, a.Date, a.Status, a.Note })
            .ToListAsync();

        var offset = (page - 1) * PageSize;
        var result = new StudentAttendancePageDto
        {
            TotalItems = total,
            Page = page,
            PageSize = PageSize,
            Summary = new StudentAttendanceSummaryDto
            {
                Present = counts.FirstOrDefault(c => c.Status == "Present")?.Count ?? 0,
                Late = counts.FirstOrDefault(c => c.Status == "Late")?.Count ?? 0,
                Absent = counts.FirstOrDefault(c => c.Status == "Absent")?.Count ?? 0,
                Excused = counts.FirstOrDefault(c => c.Status == "Excused")?.Count ?? 0
            },
            Items = rows.Select((a, i) => new StudentAttendanceItemDto
            {
                Id = a.Id,
                SessionNumber = total - offset - i,
                Date = a.Date,
                Status = a.Status,
                Note = a.Note
            }).ToList()
        };

        return Ok(result);
    }
}