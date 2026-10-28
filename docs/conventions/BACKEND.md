# Quy ước code Backend (Conventions)

Bản cho người. Bản đầy đủ có ví dụ code nằm ở `.claude/context/backend.md`. Tech stack xem `TECH-STACK.md`.

## Nguyên tắc chung
- KHÔNG tự cài package NuGet. Cần thì bàn nhóm và cập nhật `TECH-STACK.md` trước.
- Trước khi push: `dotnet build` phải xanh (đứng ở `app/backend/EnglishCenter.Api`).
- Sửa file DÙNG CHUNG (`Program.cs`, `AppDbContext.cs`, `Services/` dùng chung, `Entities/` dùng chung, `Migrations/`) thì báo nhóm trước.

## Đặt tên
- Class, method, property: `PascalCase`. Biến, tham số: `camelCase`. Field private: `_camelCase`.
- Method async có hậu tố `Async`.
- Controller: `<TàiNguyên>Controller` trong thư mục vùng (`Admin/`, `TeacherPortal/`, `StudentPortal/`, `Public/`).
- DTO: `<Thứ>Request` / `<Thứ>Response` trong `Dtos/<Vùng>/`.
- Route: `api/<vùng>/<tài-nguyên-số-nhiều>` viết thường, gạch nối.
- Migration: tiếng Anh PascalCase mô tả thay đổi (`AddStudentPortal`, `AddCourseSlug`).

## Thêm một endpoint
1. Ghi vào `docs/api/<VÙNG>_API.md`.
2. DTO request (có `[Required]`, `[Range]`…, message tiếng Việt).
3. Action trong controller của vùng. Portal thì **luôn** lọc theo chủ sở hữu.
4. Logic dùng lại ở nhiều nơi thì đưa vào `Services/` và đăng ký `AddScoped` trong `Program.cs`.
5. Thêm request mẫu vào file `.http` của vùng.
6. `dotnet build`.

## Thêm một bảng
1. `Entities/<Ten>.cs`.
2. `DbSet` + cấu hình trong `AppDbContext.<Vùng>.cs`.
3. `dotnet ef migrations add <Ten>` rồi `dotnet ef database update`.
4. Commit cả 3 file migration. Báo nhóm pull và update DB.

## Lỗi
- Trả `{ message }` tiếng Việt có dấu, đúng mã: 400 / 403 / 404 / 409 / 423.
- Service trả `ServiceResult.Fail(status, message)`, không throw cho lỗi nghiệp vụ.

## Ngày giờ
- Giờ địa phương. Dùng `AppTime.Now` / `AppTime.Today`. Dùng `DateOnly` cho ngày, `TimeOnly` cho giờ.

## Git
- Nhánh theo vùng: `feature/student-...`, `feature/teacher-...`, `feature/admin-...`. PR về `main`.
- Không commit `bin/`, `obj/`, `.vs/`, `wwwroot/uploads/*` (trừ `.gitkeep`).
