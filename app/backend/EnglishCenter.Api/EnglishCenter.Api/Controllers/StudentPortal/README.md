# Controllers/StudentPortal/: `api/student/*` (CHƯA CÓ CODE)

Người giữ: **Nam**. Hợp đồng: `docs/api/STUDENT_API.md`. Việc: `plans/10`–`14`.

## File dự kiến

| File | Route | Plan |
|---|---|---|
| `StudentControllerBase.cs` | (lớp cha, không route) | 10 |
| `DashboardController.cs` | `api/student/dashboard` | 10 |
| `ProfileController.cs` | `api/student/profile` | 10 |
| `StudentClassesController.cs` | `api/student/classes` | 10, 13 |
| `ScheduleController.cs` | `api/student/schedule` | 11 |
| `RequestsController.cs` | `api/student/requests`, `api/student/teachers/{id}/availability`, `api/student/one-on-one` | 11 |
| `AssignmentsController.cs` | `api/student/assignments`, `api/student/submissions` | 12 |
| `FilesController.cs` | `api/student/files` | 12 |
| `ProgressController.cs` | `api/student/progress`, `reviews`, `final-report`, `teacher-ratings` | 13 |
| `TuitionController.cs` | `api/student/tuition` | 14 |
| `NotificationsController.cs` | `api/student/notifications`, `api/student/announcements` | 14 |

## Khuôn bắt buộc

Chép từ `../TeacherPortal/TeacherControllerBase.cs`, đổi sang học viên:

```csharp
namespace EnglishCenter.Api.Controllers.StudentPortal;

[ApiController]
[Authorize(Roles = "student")]
public abstract class StudentControllerBase : ControllerBase, IAsyncActionFilter
{
    protected readonly AppDbContext Db;
    protected StudentControllerBase(AppDbContext db) { Db = db; }

    protected int UserId { get; private set; }
    protected int StudentId { get; private set; }
    protected string StudentName { get; private set; } = "";

    // OnActionExecutionAsync: lấy UserId từ ClaimTypes.NameIdentifier → tra Db.Students theo UserId
    //   → không có hồ sơ: 403 { message = "Tài khoản chưa có hồ sơ học viên" }

    protected IQueryable<Enrollment> MyEnrollments =>
        Db.Enrollments.Where(e => e.StudentId == StudentId && e.Status == "Active");
    protected Task<bool> IsEnrolledAsync(int classId) => MyEnrollments.AnyAsync(e => e.ClassId == classId);
    // MySessionAsync(sessionId): buổi thuộc lớp mình đang học
    protected ObjectResult Error(int statusCode, string message) => StatusCode(statusCode, new { message });
}
```

Mọi controller trong thư mục này **kế thừa** `StudentControllerBase`, và **mọi** truy vấn lọc theo `StudentId` / `IsEnrolledAsync`.
Nộp bài **bắt buộc** qua `SubmissionService.SubmitAsync`.

Xóa file README này khi đã có code (hoặc giữ lại làm mục lục).
