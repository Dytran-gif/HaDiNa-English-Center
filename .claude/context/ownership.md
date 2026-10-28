# Ai giữ phần nào (chia theo thư mục để không đụng nhau)

Cập nhật bảng này khi phân công thay đổi. Tên lấy theo `app/frontend/CLAUDE.md` cũ. Chỗ ghi `⟨cần điền⟩` thì nhóm tự điền.

## Vùng

| Vùng | Frontend | Backend | Người giữ |
|---|---|---|---|
| Public + nền auth | `src/pages/*.tsx` (public), `src/components/sections/`, `src/components/layout/`, `src/context/`, `src/components/ProtectedRoute.tsx` | `Controllers/Public/`, `Controllers/AuthController.cs` | Hoàng |
| Student | `src/pages/student/`, `src/data/StudentData/`, `src/types/StudentTypes/` | `Controllers/StudentPortal/`, `Dtos/StudentPortal/`, `Data/AppDbContext.Student.cs` | Nam |
| Teacher | `src/pages/teacher/`, `src/data/TeacherData/` | `Controllers/TeacherPortal/`, `Dtos/TeacherPortal/`, `Data/AppDbContext.Teacher.cs`, `Data/TeacherSeeder.cs` | Duy (Dytran-gif) |
| Admin | `src/pages/admin/`, `src/data/AdminData/` | `Controllers/Admin/`, `Dtos/Admin/` | ⟨cần điền⟩ |

## File DÙNG CHUNG: sửa thì báo nhóm trước, PR riêng càng tốt

**Frontend**
- `src/routes.tsx`, `src/App.tsx`, `src/main.tsx`
- `src/styles/tokens.css`, `src/styles/global.css`
- `src/components/ui/`
- `src/context/`
- `src/services/apiClient.ts` (khi có)
- `src/data/index.ts`, `src/types/index.ts` (barrel)
- `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`

**Backend**
- `Program.cs` (đăng ký service, middleware)
- `Data/AppDbContext.cs`, `Data/DbSeeder.cs`
- `Migrations/` (một người tạo một migration, xem `backend.md`)
- `Services/` dùng chung nhiều vùng: `SubmissionService`, `NotificationService`, `SessionService`, `EnrollmentService`, `StatsService`, `FileStorageService`, `TokenService`
- `Entities/` dùng chung (`User`, `Course`, `CourseClass`, `Enrollment`…)
- `EnglishCenter.Api.csproj`

**Repo**
- `CLAUDE.md`, `.claude/`, `docs/api/README.md`, `docs/conventions/`

## Cách làm khi cần sửa file của vùng khác

1. Ghi rõ vào plan, mục "Ảnh hưởng vùng khác".
2. Nhắn chủ vùng. Họ duyệt PR đó.
3. Thay đổi càng nhỏ càng tốt, ví dụ chỉ thêm 1 dòng route hoặc 1 `AddScoped`.
