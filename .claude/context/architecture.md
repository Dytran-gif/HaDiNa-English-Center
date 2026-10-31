# Kiến trúc tổng thể

## Luồng một request

```
Trình duyệt (React, :5173)
  └─ page  src/pages/<role>/<Feature>/<Feature>.tsx
       └─ service  src/services/<vùng>/<tài-nguyên>.ts      ← Admin đã dùng services/admin/useAdminApi.ts
            └─ apiClient  src/services/apiClient.ts          ← gắn "Authorization: Bearer <token>", parse lỗi
                 │  HTTP JSON (camelCase)
                 ▼
ASP.NET Core API (:5220)
  └─ Controller  Controllers/<Vùng>/<TàiNguyên>Controller.cs  ← [Authorize(Roles=...)], kiểm tra quyền sở hữu
       ├─ Service  Services/<Tên>Service.cs                   ← nghiệp vụ dùng chung giữa nhiều controller
       └─ AppDbContext  Data/AppDbContext*.cs                 ← EF Core → SQL Server (EnglishCenterDb)
```

## Bốn "vùng" (chia theo vai trò, khớp nhau giữa FE và BE)

| Vùng | Route FE | Thư mục FE | Prefix API | Thư mục BE | Trạng thái |
|---|---|---|---|---|---|
| Public (khách) | `/`, `/khoa-hoc`, `/giao-vien`, `/blog`, `/lien-he`, `/dang-nhap` | `src/pages/*.tsx`, `src/components/sections/` | `api/public/...` | `Controllers/Public/` | FE xong (mock), **BE chưa có** |
| Admin | `/admin/*` | `src/pages/admin/` | `api/admin/...` | `Controllers/Admin/` | 8 trang FE dùng API thật; Dashboard/Blog/Reports minh họa, BE còn một phần |
| Teacher | `/teacher/*` | `src/pages/teacher/` | `api/teacher/...` | `Controllers/TeacherPortal/` | FE xong (mock), BE đầy đủ (`docs/api/TEACHER_API.md`) |
| Student | `/student/*` | `src/pages/student/` | `api/student/...` | `Controllers/StudentPortal/` | FE một phần, **BE chưa có** |
| Chung | — | `src/context/`, `src/components/ui/` | `api/auth/...` | `Controllers/AuthController.cs`, `Services/` | Có |

## Thêm một tính năng end-to-end (thứ tự chuẩn)

1. **Hợp đồng API**: viết hoặc cập nhật bảng endpoint trong `docs/api/<VÙNG>_API.md` (method, URL, body, response, lỗi).
2. **Entity** (nếu cần bảng mới): `Entities/<Ten>.cs`, khai báo `DbSet` + cấu hình trong `AppDbContext` (hoặc file partial của vùng), rồi tạo migration.
3. **DTO**: `Dtos/<Vùng>/<Ten>Requests.cs` (request có `[Required]`, `[Range]`…). Response có thể là DTO hoặc anonymous object.
4. **Service** (chỉ khi logic dùng lại ở nhiều nơi): `Services/<Ten>Service.cs`, đăng ký `AddScoped` trong `Program.cs`.
5. **Controller**: `Controllers/<Vùng>/<Ten>Controller.cs`, kế thừa base của vùng.
6. **Test thủ công**: thêm request vào file `.http` của vùng (`Teacher.http`, …).
7. **FE type**: `src/types/<ten>.ts` + export trong `src/types/index.ts`.
8. **FE service**: `src/services/<vùng>/<ten>.ts`, gọi `apiClient`.
9. **FE page**: thay mock bằng service, xử lý loading / lỗi / rỗng.
10. `/validate`, rồi `/review`.

Không phải tính năng nào cũng đủ 10 bước. Ví dụ FE thuần chỉ cần bước 7 → 9 với mock.

## File quan trọng

| File | Vai trò |
|---|---|
| `app/backend/EnglishCenter.Api/EnglishCenter.Api/Program.cs` | DI, JWT, migrate + seed khi khởi động, middleware |
| `.../Controllers/TeacherPortal/TeacherControllerBase.cs` | Mẫu lớp base cho một portal (lọc theo chủ sở hữu) |
| `.../Controllers/Admin/RoomsController.cs` | Mẫu CRUD đơn giản nhất |
| `.../Data/AppDbContext.cs` + `AppDbContext.Teacher.cs` | DbSet + cấu hình, chia partial theo vùng |
| `.../Data/DbSeeder.cs`, `TeacherSeeder.cs` | Dữ liệu demo |
| `app/frontend/src/routes.tsx` | Khai báo toàn bộ route FE |
| `app/frontend/src/context/AuthContext.tsx` | Đăng nhập API thật + lựa chọn demo, token trong context |
| `app/frontend/src/hooks/useLocalCollection.ts` | CRUD tạm trên localStorage, sẽ thay bằng service |
