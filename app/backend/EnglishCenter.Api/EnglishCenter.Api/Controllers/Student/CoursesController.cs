using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Danh sách khóa học của trung tâm cho trang Courses của học viên.
// Đăng ký học: chọn khóa -> GET {courseId}/classes chọn lớp -> POST api/student/enrollments { classId }.
[Route("api/student/courses")]
public class CoursesController : StudentControllerBase
{
    private readonly AppDbContext _db;
    private readonly EnrollmentService _enrollments;

    public CoursesController(AppDbContext db, EnrollmentService enrollments) : base(db)
    {
        _db = db;
        _enrollments = enrollments;
    }

    // GET api/student/courses
    // Chỉ trả khóa đang hiển thị và còn lớp chưa kết thúc để đăng ký.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var today = AppTime.Today;
        var rows = await _db.Courses.AsNoTracking()
            .Where(c => c.IsPublished && c.Classes.Any(x => x.EndDate >= today))
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Description,
                c.BandFrom,
                c.BandTo,
                c.TotalSessions,
                c.SessionsPerWeek,
                c.Tuition,
                c.DiscountPercent,
                c.ImageUrl
            })
            .ToListAsync();

        // Giáo viên của từng khóa (lấy từ các lớp của khóa, bỏ trùng)
        var courseIds = rows.Select(r => r.Id).ToList();
        var teachers = await _db.Classes.AsNoTracking()
            .Where(c => courseIds.Contains(c.CourseId))
            .Select(c => new { c.CourseId, TeacherName = c.Teacher.FullName })
            .Distinct()
            .ToListAsync();

        var courses = rows.Select(c => new CourseItemDto
        {
            Id = c.Id.ToString(),
            Name = c.Name,
            Description = c.Description ?? "",
            BandFrom = c.BandFrom.ToString("0.#"),
            BandTo = c.BandTo.ToString("0.#"),
            TotalSessions = c.TotalSessions,
            SessionsPerWeek = c.SessionsPerWeek,
            Tuition = c.Tuition,
            DiscountPercent = c.DiscountPercent,
            ImageUrl = c.ImageUrl,
            TeacherName = string.Join(", ", teachers.Where(t => t.CourseId == c.Id).Select(t => t.TeacherName))
        }).ToList();

        return Ok(courses);
    }

    private static string DayName(byte d) => d switch
    {
        1 => "Mon", 2 => "Tue", 3 => "Wed", 4 => "Thu", 5 => "Fri", 6 => "Sat", 7 => "Sun",
        _ => ""
    };

    // GET api/student/courses/{courseId}/detail - chi tiết khóa cho popup Present Lessons:
    // thông tin khóa + danh sách giáo viên + các lớp (kèm lịch học, phòng).
    [HttpGet("{courseId}/detail")]
    public async Task<IActionResult> GetDetail(int courseId)
    {
        var course = await _db.Courses.AsNoTracking()
            .Where(c => c.Id == courseId)
            .Select(c => new
            {
                c.Id, c.Name, c.Description, c.BandFrom, c.BandTo,
                c.TotalSessions, c.SessionsPerWeek, c.Tuition, c.DiscountPercent
            })
            .FirstOrDefaultAsync();

        if (course == null)
            return NotFound(new { message = "Không tìm thấy khóa học" });

        // Giáo viên dạy khóa (bỏ trùng, kèm chuyên môn + bằng cấp)
        var teachers = await _db.Classes.AsNoTracking()
            .Where(c => c.CourseId == courseId)
            .Select(c => new { c.Teacher.FullName, c.Teacher.Specialty, c.Teacher.Degree })
            .Distinct()
            .ToListAsync();

        // Các lớp của khóa
        var classes = await _db.Classes.AsNoTracking()
            .Where(c => c.CourseId == courseId && c.EndDate >= AppTime.Today)
            .OrderBy(c => c.StartDate)
            .Select(c => new
            {
                c.Id, c.Code, c.Name, c.StartDate, c.EndDate, c.MaxStudents,
                TeacherName = c.Teacher.FullName
            })
            .ToListAsync();

        // Lịch học + phòng của các lớp
        var classIds = classes.Select(c => c.Id).ToList();
        var schedules = await _db.ClassSchedules.AsNoTracking()
            .Where(s => classIds.Contains(s.ClassId))
            .OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
            .Select(s => new { s.ClassId, s.DayOfWeek, s.StartTime, s.EndTime, RoomName = s.Room.Name })
            .ToListAsync();

        return Ok(new StudentCourseDetailDto
        {
            Id = course.Id.ToString(),
            Name = course.Name,
            Description = course.Description,
            BandFrom = course.BandFrom.ToString("0.#"),
            BandTo = course.BandTo.ToString("0.#"),
            TotalSessions = course.TotalSessions,
            SessionsPerWeek = course.SessionsPerWeek,
            Tuition = course.Tuition,
            DiscountPercent = course.DiscountPercent,
            Teachers = teachers.Select(t => new StudentCourseTeacherDto
            {
                FullName = t.FullName,
                Specialty = t.Specialty,
                Degree = t.Degree
            }).ToList(),
            Classes = classes.Select(c => new StudentCourseClassDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                MaxStudents = c.MaxStudents,
                TeacherName = c.TeacherName,
                Schedules = schedules.Where(s => s.ClassId == c.Id)
                    .Select(s => new StudentCourseScheduleDto
                    {
                        DayOfWeek = DayName(s.DayOfWeek),
                        StartTime = s.StartTime.ToString("HH:mm"),
                        EndTime = s.EndTime.ToString("HH:mm"),
                        RoomName = s.RoomName
                    }).ToList()
            }).ToList()
        });
    }

    // GET api/student/courses/{courseId}/classes - các lớp còn mở của khóa để học viên chọn lớp đăng ký.
    // Mỗi lớp kèm sĩ số, học phí, và lý do không đăng ký được (đầy / trùng lịch / đang học khóa này).
    [HttpGet("{courseId:int}/classes")]
    public async Task<IActionResult> GetClasses(int courseId)
    {
        var course = await _db.Courses.AsNoTracking().Where(c => c.Id == courseId && c.IsPublished)
            .Select(c => new { c.Tuition, c.DiscountPercent }).FirstOrDefaultAsync();
        if (course == null) return Error(404, "Không tìm thấy khóa học");

        var today = AppTime.Today;
        var rows = await _db.Classes.AsNoTracking()
            .Where(c => c.CourseId == courseId && c.EndDate >= today)
            .OrderBy(c => c.StartDate).ThenBy(c => c.Code)
            .Select(c => new
            {
                c.Id, c.Code, c.Name, TeacherName = c.Teacher.FullName, c.StartDate, c.EndDate, c.MaxStudents,
                Enrolled = c.Enrollments.Count(e => e.Status == "Active"),
                Slots = c.Schedules.OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
                    .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime, RoomName = s.Room.Name }).ToList()
            })
            .ToListAsync();

        var checks = await _enrollments.CheckAsync(StudentId, rows.Select(r => r.Id));
        var items = rows.Select(r =>
        {
            var slots = r.Slots.Select(s => new ClassCalendar.Slot(s.DayOfWeek, s.StartTime, s.EndTime)).ToList();
            var total = ClassCalendar.TotalSessions(r.StartDate, r.EndDate, slots);
            var done = ClassCalendar.DoneSessions(r.StartDate, r.EndDate, slots, today.AddDays(-1));
            var quote = EnrollmentService.Quote(course.Tuition, course.DiscountPercent, 0, total - done, total, false, null);
            var check = checks.GetValueOrDefault(r.Id) ?? new ClassAvailability(false, false, null, null);
            return new StudentClassOptionDto
            {
                Id = r.Id, Code = r.Code, Name = r.Name, TeacherName = r.TeacherName,
                StartDate = r.StartDate, EndDate = r.EndDate,
                Status = ClassCalendar.Status(r.StartDate, r.EndDate, today),
                Schedules = r.Slots.Select(s => new StudentClassSlotDto
                {
                    DayOfWeek = s.DayOfWeek, StartTime = s.StartTime.ToString("HH:mm"),
                    EndTime = s.EndTime.ToString("HH:mm"), RoomName = s.RoomName
                }).ToList(),
                Enrolled = r.Enrolled, MaxStudents = r.MaxStudents,
                TotalSessions = total, RemainingSessions = total - done,
                FinalTuition = quote.FinalTuitionFee,
                IsFull = check.IsFull, Conflict = check.Conflict, AlreadyInCourse = check.AlreadyInCourse,
                CanEnroll = check.CanEnroll, Reason = check.Reason
            };
        }).ToList();

        return Ok(items);
    }
}
