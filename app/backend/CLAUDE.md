# Backend — EnglishCenter.Api (ASP.NET Core)

Luật chung của cả repo nằm ở **`../../CLAUDE.md`** (đọc trước). File này chỉ ghi phần riêng của BE.
Pattern chi tiết + ví dụ: `../../.claude/context/backend.md`. Quy ước: `../../docs/conventions/BACKEND.md`.

## Chạy

```powershell
cd EnglishCenter.Api\EnglishCenter.Api
dotnet tool install --global dotnet-ef   # lần đầu
dotnet ef database update                # tạo/cập nhật DB EnglishCenterDb
dotnet run                               # http://localhost:5220  (OpenAPI: /openapi/v1.json)
```
Chuỗi kết nối: `appsettings.json` → `ConnectionStrings:Default` (mặc định SQL Server `localhost`, Windows auth).
Máy dùng LocalDB / SQL Express thì đổi trong `appsettings.Development.json` trên máy mình, **đừng commit** chuỗi riêng.

Khi khởi động mặc định chỉ kết nối DB hiện có, không migrate/seed. Chỉ bật Database:InitializeOnStartup=true khi chủ động khởi tạo DB; không bật cho DB thật đang thử nghiệm.

## Bản đồ

| Thư mục | Chứa | Vùng |
|---|---|---|
| `Controllers/AuthController.cs` | `api/auth/login`, `api/auth/me` | Chung |
| `Controllers/Admin/` | `api/admin/*`, `[Authorize(Roles="admin")]` | Admin |
| `Controllers/TeacherPortal/` | `api/teacher/*`, kế thừa `TeacherControllerBase` | Teacher |
| `Controllers/StudentPortal/` | `api/student/*`, **chưa có**: xem README trong thư mục | Student |
| `Controllers/Public/` | `api/public/*`, **chưa có**: xem README trong thư mục | Public |
| `Dtos/<Vùng>/` | Request/Response | theo vùng |
| `Entities/` | Entity EF | dùng chung |
| `Data/` | `AppDbContext` (partial theo vùng), Seeder | dùng chung |
| `Services/` | Nghiệp vụ dùng chung | dùng chung |
| `Migrations/` | do EF sinh, KHÔNG sửa tay | dùng chung |
| `*.http` | Request mẫu test tay | theo vùng |

## Lệnh kiểm tra
```
cd app/backend/EnglishCenter.Api
dotnet build
```
`dotnet build` báo khóa file (MSB3027) nghĩa là API đang chạy. Dừng `dotnet run` rồi build lại.

## Hiện trạng cần biết
- Migration cho bảng Teacher **chưa được tạo** (plan `00`).
- **Chưa có CORS**. `UseHttpsRedirection` và `UseAuthorization` đang gọi 2 lần (plan `01`).
- Chưa có project test (plan `90`).
