# Backend — ASP.NET Core + EF Core

Gốc: `app/backend/EnglishCenter.Api/EnglishCenter.Api/` (gọi tắt `API/`).

## Cấu trúc

```
API/
├── Program.cs              # DI + JWT; migrate/seed chỉ khi Database:InitializeOnStartup=true
├── Controllers/
│   ├── AuthController.cs   # api/auth/login, api/auth/me
│   ├── Admin/              # [Authorize(Roles="admin")]   api/admin/...
│   ├── TeacherPortal/      # kế thừa TeacherControllerBase  api/teacher/...
│   ├── StudentPortal/      # (CHƯA CÓ) StudentControllerBase  api/student/...
│   └── Public/             # (CHƯA CÓ) [AllowAnonymous]     api/public/...
├── Dtos/  Admin/ · TeacherPortal/ · StudentPortal/ · Common/ (LoginRequest, PagedResult…)
├── Entities/               # 1 file / entity (Requests.cs gom các loại đơn)
├── Data/                   # AppDbContext (partial theo vùng) + Seeder
├── Services/               # nghiệp vụ dùng chung
├── Migrations/             # do EF sinh, KHÔNG sửa tay
├── wwwroot/uploads/        # file upload (FileStorageService)
├── Teacher.http, EnglishCenter.Api.http   # request mẫu để test tay
└── appsettings.json        # ConnectionStrings:Default, Jwt:*
```

## Pattern controller

**Admin (đơn giản)**: xem `Controllers/Admin/RoomsController.cs`.
```csharp
[ApiController]
[Route("api/admin/rooms")]
[Authorize(Roles = "admin")]
public class RoomsController : ControllerBase
{
    private readonly AppDbContext _db;
    public RoomsController(AppDbContext db) { _db = db; }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null) return NotFound(new { message = "Không tìm thấy phòng học" });
        return Ok(new RoomResponse { ... });
    }
}
```

**Portal (có chủ sở hữu)**: kế thừa base của vùng, xem `TeacherControllerBase.cs`.
- Base implement `IAsyncActionFilter`, lấy `UserId` từ claim `NameIdentifier`, tra hồ sơ (`Teachers`/`Students`) rồi gán `TeacherId`/`StudentId`. Không có hồ sơ thì trả 403.
- Cung cấp helper: `MyClasses`, `OwnsClassAsync`, `MySessionAsync`, `Error(status, message)`.
- **Mọi** truy vấn phải đi qua helper hoặc lọc `TeacherId`/`StudentId`. Không có ngoại lệ.
- `StudentControllerBase` (plan `10`) phải làm y như vậy: `MyEnrollments`, `IsEnrolledAsync(classId)`, `MyClassIds`.

## Lỗi & mã trạng thái

| Mã | Khi nào | Cách trả |
|---|---|---|
| 400 | Dữ liệu sai nghiệp vụ | `BadRequest(new { message })` / `Error(400, ...)` |
| 400 (tự động) | DTO vi phạm `[Required]`/`[Range]`… | ASP.NET trả ProblemDetails, không cần code |
| 401 | Chưa đăng nhập / token sai / bị thu hồi | do JWT middleware |
| 403 | Sai vai trò / không sở hữu tài nguyên / tài khoản khóa | `StatusCode(403, new { message })` |
| 404 | Không tìm thấy (hoặc **không thuộc quyền**, để không lộ id tồn tại) | `NotFound(new { message })` |
| 409 | Xung đột nghiệp vụ (trùng tên, trùng lịch, đã có bài nộp…) | `Conflict(new { message })` |
| 423 | Đã khóa (điểm danh quá 48h) | `Error(423, ...)` |

Message viết **tiếng Việt, có dấu**, câu ngắn cho người dùng cuối đọc được.

## Service

- Đăng ký `builder.Services.AddScoped<XxxService>()` trong `Program.cs`.
- Lỗi nghiệp vụ trả `ServiceResult.Fail(status, message)` (xem `SubmissionService.cs`). Controller map sang HTTP:
  ```csharp
  var r = await _submissions.SubmitAsync(...);
  if (!r.Success) return Error(r.StatusCode, r.Message);
  ```
- Hàm thuần (không DB) để `static` (vd `IeltsBands.Overall`, `SessionService.StatusOf`) cho dễ test.
- Service dùng chung giữa các vùng: `SubmissionService` (Student nộp bài, Teacher chấm), `NotificationService`, `SessionService`, `EnrollmentService`, `StatsService`.

## Entity & migration

- 1 class/file trong `Entities/`, có `Id` int, quan hệ khai báo navigation (`public CourseClass Class { get; set; } = null!;`).
- Trạng thái là `string` + comment liệt kê giá trị hợp lệ (`// Pending | Approved | Rejected | Cancelled`). Nếu cần thì thêm check constraint trong `OnModelCreating`.
- Cấu hình bảng (độ dài, index, FK, `OnDelete`) đặt trong `AppDbContext` của vùng. **Bảng của Student thì tạo `AppDbContext.Student.cs`** (partial), không nhồi vào file của vùng khác.
- Tạo migration (đứng ở thư mục `API/`):
  ```powershell
  dotnet ef migrations add <TenTiengAnhPascalCase>
  dotnet ef database update
  ```
- `Program.cs` tự `MigrateAsync()` lúc chạy, nhưng migration **phải** được tạo và commit trước.
- Không sửa migration đã push. Cần đổi thì tạo migration mới.

## Upload file

`FileStorageService.Validate(file, folder)` rồi `SaveAsync(file, folder)` trả URL dạng `/uploads/<folder>/...`. Giới hạn kích thước và đuôi file nằm trong service.

## Không làm

- Không viết SQL thô khi LINQ làm được.
- Không trả entity EF trực tiếp ra JSON (dễ vòng lặp, lộ `PasswordHash`). Phải `Select` sang DTO/anonymous.
- Không gọi `DateTime.UtcNow` cho dữ liệu nghiệp vụ. Dùng `AppTime` (xem `datetime.md`).
- Không đặt logic phân quyền ở FE rồi bỏ qua ở BE.
