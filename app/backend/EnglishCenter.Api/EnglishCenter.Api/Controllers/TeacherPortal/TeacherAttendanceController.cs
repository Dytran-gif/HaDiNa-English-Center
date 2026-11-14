using System.ComponentModel.DataAnnotations;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.TeacherPortal;

// Điểm danh theo ngày học (bảng Attendances). Ngày học = ngày có lịch tuần (ClassSchedules) của lớp,
// nằm trong StartDate–EndDate của lớp. Chỉ điểm danh ngày hôm nay hoặc đã qua.
[Route("api/teacher/attendance")]
public class TeacherAttendanceController : TeacherControllerBase
{
    public static readonly string[] Statuses = { "Present", "Late", "Absent", "Excused" };
    private const int MaxRangeDays = 120;

    public TeacherAttendanceController(AppDbContext db) : base(db) { }

    private record ClassInfo(int Id, string Name, DateOnly StartDate, DateOnly EndDate, List<SlotInfo> Slots);
    private record SlotInfo(byte DayOfWeek, TimeOnly StartTime, TimeOnly EndTime, string RoomName);

    private async Task<ClassInfo?> MyClassAsync(int classId)
    {
        var c = await MyClasses.AsNoTracking().Where(x => x.Id == classId)
            .Select(x => new
            {
                x.Id, x.Name, x.StartDate, x.EndDate,
                Slots = x.Schedules.OrderBy(s => s.StartTime)
                    .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime, RoomName = s.Room.Name }).ToList()
            })
            .FirstOrDefaultAsync();
        return c == null ? null
            : new ClassInfo(c.Id, c.Name, c.StartDate, c.EndDate,
                c.Slots.Select(s => new SlotInfo(s.DayOfWeek, s.StartTime, s.EndTime, s.RoomName)).ToList());
    }

    // Các ngày học của lớp trong khoảng [from, to]
    private static IEnumerable<DateOnly> ClassDays(ClassInfo c, DateOnly from, DateOnly to)
    {
        var start = from > c.StartDate ? from : c.StartDate;
        var end = to < c.EndDate ? to : c.EndDate;
        var days = c.Slots.Select(s => (int)s.DayOfWeek).ToHashSet();
        for (var d = start; d <= end; d = d.AddDays(1))
            if (days.Contains(AppTime.DayNo(d))) yield return d;
    }

    private static bool IsClassDay(ClassInfo c, DateOnly date) =>
        date >= c.StartDate && date <= c.EndDate && c.Slots.Any(s => s.DayOfWeek == AppTime.DayNo(date));

    // GET api/teacher/attendance/sessions?classId=5&from=&to=
    // Danh sách ngày học (mặc định từ đầu lớp tới hôm nay, mới nhất trước) kèm số đã điểm danh
    [HttpGet("sessions")]
    public async Task<IActionResult> Sessions(int classId, DateOnly? from, DateOnly? to)
    {
        var c = await MyClassAsync(classId);
        if (c == null) return Error(404, "Không tìm thấy lớp hoặc bạn không phụ trách lớp này");

        var today = AppTime.Today;
        var end = to ?? today;
        if (end > today) end = today;
        var start = from ?? end.AddDays(-(MaxRangeDays - 1));
        if (end < start) return Ok(Array.Empty<object>());
        if (end.DayNumber - start.DayNumber >= MaxRangeDays) start = end.AddDays(-(MaxRangeDays - 1));

        var studentCount = await Db.Enrollments.CountAsync(e => e.ClassId == classId && e.Status == "Active");
        var marked = await Db.Attendances.AsNoTracking()
            .Where(a => a.ClassId == classId && a.Date >= start && a.Date <= end)
            .GroupBy(a => a.Date)
            .Select(g => new
            {
                Date = g.Key, Count = g.Count(),
                Absent = g.Count(a => a.Status == "Absent"),
                Late = g.Count(a => a.Status == "Late")
            })
            .ToDictionaryAsync(x => x.Date);

        var items = ClassDays(c, start, end)
            .OrderByDescending(d => d)
            .Select(d =>
            {
                var slot = c.Slots.First(s => s.DayOfWeek == AppTime.DayNo(d));
                marked.TryGetValue(d, out var m);
                return new
                {
                    Date = d, slot.StartTime, slot.EndTime, slot.RoomName,
                    StudentCount = studentCount,
                    MarkedCount = m?.Count ?? 0,
                    AbsentCount = m?.Absent ?? 0,
                    LateCount = m?.Late ?? 0,
                    IsToday = d == today
                };
            })
            .ToList();
        return Ok(items);
    }

    // GET api/teacher/attendance?classId=5&date=2026-11-12 - bảng điểm danh của 1 ngày
    [HttpGet]
    public async Task<IActionResult> Roster(int classId, DateOnly date)
    {
        var c = await MyClassAsync(classId);
        if (c == null) return Error(404, "Không tìm thấy lớp hoặc bạn không phụ trách lớp này");
        if (!IsClassDay(c, date)) return Error(400, "Ngày này lớp không có lịch học");

        var records = await Db.Attendances.AsNoTracking()
            .Where(a => a.ClassId == classId && a.Date == date)
            .ToDictionaryAsync(a => a.StudentId);

        // Học viên đang học + học viên đã nghỉ nhưng từng được điểm danh ngày này
        var recordIds = records.Keys.ToList();
        var students = await Db.Enrollments.AsNoTracking()
            .Where(e => e.ClassId == classId && (e.Status == "Active" || recordIds.Contains(e.StudentId)))
            .OrderBy(e => e.Student.FullName)
            .Select(e => new { e.StudentId, e.Student.Code, e.Student.FullName, EnrollmentStatus = e.Status })
            .ToListAsync();

        var slot = c.Slots.First(s => s.DayOfWeek == AppTime.DayNo(date));
        return Ok(new
        {
            ClassId = c.Id, ClassName = c.Name, Date = date, slot.StartTime, slot.EndTime, slot.RoomName,
            CanEdit = date <= AppTime.Today,
            Items = students.Select(s =>
            {
                records.TryGetValue(s.StudentId, out var r);
                return new { s.StudentId, s.Code, s.FullName, s.EnrollmentStatus, Status = r?.Status, Note = r?.Note };
            })
        });
    }

    public class SaveRequest
    {
        [Range(1, int.MaxValue)] public int ClassId { get; set; }
        public DateOnly Date { get; set; }
        [Required] public List<SaveItem> Items { get; set; } = new();
    }

    public class SaveItem
    {
        [Range(1, int.MaxValue)] public int StudentId { get; set; }
        [Required] public string Status { get; set; } = "";
        [MaxLength(300, ErrorMessage = "Ghi chú tối đa 300 ký tự")] public string? Note { get; set; }
    }

    // PUT api/teacher/attendance { classId, date, items: [{ studentId, status, note }] } - lưu (thêm hoặc sửa)
    [HttpPut]
    public async Task<IActionResult> Save(SaveRequest req)
    {
        var c = await MyClassAsync(req.ClassId);
        if (c == null) return Error(404, "Không tìm thấy lớp hoặc bạn không phụ trách lớp này");
        if (!IsClassDay(c, req.Date)) return Error(400, "Ngày này lớp không có lịch học");
        if (req.Date > AppTime.Today) return Error(400, "Chưa tới ngày học, chưa điểm danh được");
        if (req.Items.Count == 0) return Error(400, "Chưa có học viên nào để lưu");
        if (req.Items.Any(i => !Statuses.Contains(i.Status))) return Error(400, "Trạng thái điểm danh không hợp lệ");
        if (req.Items.Select(i => i.StudentId).Distinct().Count() != req.Items.Count)
            return Error(400, "Một học viên bị gửi 2 lần");

        var ids = req.Items.Select(i => i.StudentId).ToList();
        var enrolled = await Db.Enrollments
            .Where(e => e.ClassId == req.ClassId && ids.Contains(e.StudentId))
            .Select(e => e.StudentId).ToListAsync();
        if (enrolled.Count != ids.Count) return Error(400, "Có học viên không thuộc lớp này");

        var existing = await Db.Attendances
            .Where(a => a.ClassId == req.ClassId && a.Date == req.Date && ids.Contains(a.StudentId))
            .ToDictionaryAsync(a => a.StudentId);

        var now = AppTime.Now;
        foreach (var i in req.Items)
        {
            var note = string.IsNullOrWhiteSpace(i.Note) ? null : i.Note.Trim();
            if (existing.TryGetValue(i.StudentId, out var a))
            {
                if (a.Status == i.Status && a.Note == note) continue;
                a.Status = i.Status;
                a.Note = note;
                a.UpdatedAt = now;
            }
            else
            {
                Db.Attendances.Add(new Attendance
                {
                    ClassId = req.ClassId, StudentId = i.StudentId, Date = req.Date,
                    Status = i.Status, Note = note, CreatedAt = now
                });
            }
        }

        try { await Db.SaveChangesAsync(); }
        catch (DbUpdateException) { return Error(409, "Dữ liệu vừa được lưu ở nơi khác, tải lại rồi thử lại"); }
        return Ok(new { message = $"Đã lưu điểm danh {req.Items.Count} học viên" });
    }

    // GET api/teacher/attendance/summary?classId=5 - chuyên cần từng học viên tới hôm nay
    [HttpGet("summary")]
    public async Task<IActionResult> Summary(int classId)
    {
        var c = await MyClassAsync(classId);
        if (c == null) return Error(404, "Không tìm thấy lớp hoặc bạn không phụ trách lớp này");

        var today = AppTime.Today;
        var heldDays = ClassDays(c, c.StartDate, today).Count();
        var markedDays = await Db.Attendances.Where(a => a.ClassId == classId).Select(a => a.Date).Distinct().CountAsync();

        var counts = await Db.Attendances.AsNoTracking()
            .Where(a => a.ClassId == classId)
            .GroupBy(a => a.StudentId)
            .Select(g => new
            {
                StudentId = g.Key,
                Present = g.Count(a => a.Status == "Present"),
                Late = g.Count(a => a.Status == "Late"),
                Absent = g.Count(a => a.Status == "Absent"),
                Excused = g.Count(a => a.Status == "Excused")
            })
            .ToDictionaryAsync(x => x.StudentId);

        var students = await Db.Enrollments.AsNoTracking()
            .Where(e => e.ClassId == classId)
            .OrderBy(e => e.Student.FullName)
            .Select(e => new { e.StudentId, e.Student.Code, e.Student.FullName, EnrollmentStatus = e.Status })
            .ToListAsync();

        return Ok(new
        {
            HeldDays = heldDays,
            MarkedDays = markedDays,
            Items = students.Select(s =>
            {
                counts.TryGetValue(s.StudentId, out var x);
                var present = x?.Present ?? 0; var late = x?.Late ?? 0; var absent = x?.Absent ?? 0; var excused = x?.Excused ?? 0;
                var total = present + late + absent + excused;
                return new
                {
                    s.StudentId, s.Code, s.FullName, s.EnrollmentStatus,
                    Present = present, Late = late, Absent = absent, Excused = excused, Total = total,
                    // Tỉ lệ đi học = (có mặt + muộn) / số buổi đã điểm danh của học viên
                    AttendanceRate = total == 0 ? (decimal?)null : Math.Round((present + late) * 100m / total, 1)
                };
            })
        });
    }
}
