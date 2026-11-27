using System.ComponentModel.DataAnnotations;
using EnglishCenter.Api.Data;
using EnglishCenter.Api.Entities;
using EnglishCenter.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// namespace ...StudentPortal vì trùng tên entity Student
namespace EnglishCenter.Api.Controllers.StudentPortal;

// Học viên đánh giá giáo viên của lớp mình đã học (lớp đã khai giảng). Mỗi lớp 1 đánh giá, sửa được.
// Đánh giá chỉ hiện ở trang public sau khi Admin duyệt; sửa lại thì chờ duyệt lại.
[Route("api/student/reviews")]
public class ReviewsController : StudentControllerBase
{
    public ReviewsController(AppDbContext db) : base(db) { }

    public record ReviewableClass(int ClassId, string ClassName, string CourseName, int TeacherId, string TeacherName,
        DateOnly StartDate, DateOnly EndDate, MyReview? Review);
    public record MyReview(int Id, int Rating, string Comment, bool IsPublished, DateTime CreatedAt);

    public class ReviewRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Hãy chọn lớp")]
        public int ClassId { get; set; }

        [Range(1, 5, ErrorMessage = "Chọn từ 1 đến 5 sao")]
        public int Rating { get; set; }

        [Required(ErrorMessage = "Hãy viết vài dòng nhận xét")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Nhận xét từ 10 đến 1000 ký tự")]
        public string Comment { get; set; } = "";
    }

    // GET api/student/reviews - các lớp đánh giá được + đánh giá của mình
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var today = AppTime.Today;
        var classes = await MyEnrollments.AsNoTracking()
            .Where(e => e.Class.StartDate <= today)
            .OrderByDescending(e => e.Class.StartDate)
            .Select(e => new
            {
                e.ClassId, e.Class.Name, CourseName = e.Class.Course.Name, e.Class.TeacherId, TeacherName = e.Class.Teacher.FullName,
                e.Class.StartDate, e.Class.EndDate
            })
            .ToListAsync();
        var ids = classes.Select(c => c.ClassId).ToList();
        var reviews = await Db.TeacherReviews.AsNoTracking()
            .Where(r => r.StudentId == StudentId && ids.Contains(r.ClassId))
            .ToDictionaryAsync(r => r.ClassId);

        return Ok(classes.Select(c => new ReviewableClass(c.ClassId, c.Name, c.CourseName, c.TeacherId, c.TeacherName,
            c.StartDate, c.EndDate,
            reviews.TryGetValue(c.ClassId, out var r) ? new MyReview(r.Id, r.Rating, r.Comment, r.IsPublished, r.CreatedAt) : null)));
    }

    // POST api/student/reviews { classId, rating, comment } - tạo hoặc sửa đánh giá của mình cho lớp
    [HttpPost]
    public async Task<IActionResult> Upsert(ReviewRequest req)
    {
        var cls = await MyEnrollments.AsNoTracking()
            .Where(e => e.ClassId == req.ClassId)
            .Select(e => new { e.ClassId, e.Class.TeacherId, e.Class.StartDate })
            .FirstOrDefaultAsync();
        if (cls == null) return Error(403, "Bạn không học lớp này");
        if (cls.StartDate > AppTime.Today) return Error(409, "Lớp chưa khai giảng, chưa đánh giá được");

        var review = await Db.TeacherReviews.FirstOrDefaultAsync(r => r.StudentId == StudentId && r.ClassId == req.ClassId);
        if (review == null)
        {
            review = new TeacherReview { StudentId = StudentId, ClassId = cls.ClassId, TeacherId = cls.TeacherId };
            Db.TeacherReviews.Add(review);
        }
        review.Rating = req.Rating;
        review.Comment = req.Comment.Trim();
        review.IsPublished = false; // chờ Admin duyệt (lại)
        try
        {
            await Db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Error(409, "Bạn vừa gửi đánh giá cho lớp này, vui lòng tải lại trang");
        }
        return Ok(new { message = "Đã gửi đánh giá. Trung tâm sẽ duyệt trước khi hiển thị trên website", id = review.Id });
    }
}
