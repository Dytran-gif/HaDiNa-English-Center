using System.Security.Claims;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Dtos.StudentPortal;
using EnglishCenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// Lưu ý: namespace phải là ...StudentPortal (không phải ...Student) vì tên "Student"
// đã trùng với entity Student, đặt tên Student sẽ phá các controller khác.
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Danh sách khóa học của trung tâm cho trang Courses của học viên.
// Viết độc lập (không theo khuôn Teacher/Admin), truy vấn thẳng AppDbContext,
// khớp type Course trong types/StudentTypes/MainTypes/GeneralTypes.ts.
[ApiController]
[Authorize(Roles = "student")]
[Route("api/student/courses")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CoursesController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/student/courses
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var rows = await _db.Courses.AsNoTracking()
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
                c.DiscountPercent
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
            ImageUrl = null, // bảng Courses chưa có cột ảnh; FE tự dùng ảnh mặc định
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
            .Where(c => c.CourseId == courseId)
            .OrderBy(c => c.StartDate)
            .Select(c => new
            {
                c.Id, c.Name, c.StartDate, c.EndDate, c.MaxStudents,
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

    // POST api/student/courses/{courseId}/register
    // Đăng ký giả lập: chọn khóa -> tạo Enrollment (Active) vào lớp đầu tiên của khóa.
    // Không cho đăng ký trùng một khóa (đã có enrollment bất kỳ cho khóa đó thì trả 409).
    [HttpPost("{courseId}/register")]
    public async Task<IActionResult> Register(int courseId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new { message = "Token không hợp lệ" });

        var student = await _db.Students.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => new { s.Id, s.FullName })
            .FirstOrDefaultAsync();

        if (student == null)
            return StatusCode(403, new { message = "Tài khoản chưa có hồ sơ học viên" });

        var course = await _db.Courses.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == courseId);
        if (course == null)
            return NotFound(new { message = "Không tìm thấy khóa học" });

        // Chặn đăng ký lại khóa đã từng đăng ký (Active/OnHold/Dropped đều tính)
        var alreadyEnrolled = await _db.Enrollments.AsNoTracking()
            .AnyAsync(e => e.StudentId == student.Id && e.Class.CourseId == courseId);
        if (alreadyEnrolled)
            return StatusCode(409, new { message = "Bạn đã đăng ký khóa học này rồi" });

        // Đăng ký vào lớp đầu tiên của khóa (theo ngày bắt đầu)
        var cls = await _db.Classes.AsNoTracking()
            .Where(c => c.CourseId == courseId)
            .OrderBy(c => c.StartDate)
            .FirstOrDefaultAsync();
        if (cls == null)
            return StatusCode(409, new { message = "Khóa học chưa có lớp để đăng ký" });

        // Chặn đăng ký khi lịch học của lớp mới trùng giờ với lớp đang học (Active)
        // (cùng ngày trong tuần + khoảng thời gian chồng lấn)
        var newSchedules = await _db.ClassSchedules.AsNoTracking()
            .Where(s => s.ClassId == cls.Id)
            .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime })
            .ToListAsync();

        if (newSchedules.Count > 0)
        {
            var existingSchedules = await _db.ClassSchedules.AsNoTracking()
                .Where(s => s.Class.Enrollments.Any(e => e.StudentId == student.Id && e.Status == "Active"))
                .Select(s => new { s.DayOfWeek, s.StartTime, s.EndTime, CourseName = s.Class.Course.Name, ClassName = s.Class.Name })
                .ToListAsync();

            var conflict = (from a in newSchedules
                            from b in existingSchedules
                            where a.DayOfWeek == b.DayOfWeek && a.StartTime < b.EndTime && b.StartTime < a.EndTime
                            select $"{b.CourseName} ({b.ClassName})").FirstOrDefault();

            if (conflict != null)
                return StatusCode(409, new { message = $"Không thể đăng ký: lịch học trùng giờ với {conflict} bạn đang học" });
        }

        var discountAmount = Math.Round(course.Tuition * course.DiscountPercent / 100, 2);
        var enrollment = new Enrollment
        {
            StudentId = student.Id,
            ClassId = cls.Id,
            TuitionFee = course.Tuition,
            DiscountPercent = course.DiscountPercent,
            DiscountAmount = discountAmount,
            FinalTuitionFee = course.Tuition - discountAmount,
            Status = "Active"
        };
        _db.Enrollments.Add(enrollment);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // unique (StudentId, ClassId): hai lần đăng ký gần như đồng thời
            return StatusCode(409, new { message = "Bạn đã đăng ký khóa học này rồi" });
        }

        return StatusCode(201, new { enrollment.Id, message = $"Đăng ký thành công khóa {course.Name}" });
    }
}
