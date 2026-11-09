# 00 — Tạo và commit migration `TeacherFeatures`

- **Loại:** plan
- **Vùng:** Teacher (ảnh hưởng mọi người)
- **Người làm:** Duy
- **Phụ thuộc:** —
- **Độ khó:** Thấp

## Mục tiêu
DB `EnglishCenterDB` hiện chỉ có 12 bảng của `InitialCreate`. Các bảng chức năng Teacher (khai báo trong `Data/AppDbContext.Teacher.cs`) **chưa có migration**, nên chưa tồn tại trong DB.

Hậu quả (kiểm tra 2026-11-01):
- Mọi API `api/teacher/*` lỗi 500.
- `GET /api/student/dashboard` (PR #1) cũng lỗi 500, vì truy vấn `ClassSessions`, `Assignments`, `Submissions`, `Attendances`, `ExamResults`, `Notifications`, `OneOnOneSessions`.
- Dạng lỗi: `Invalid object name 'ClassSessions'`.

Tạo **một** migration, commit lên để cả nhóm dùng chung, không ai phải tự tạo.

## Migration dự kiến sinh ra
- **Tạo 22 bảng:** `ClassSessions`, `SyllabusLessons`, `SessionMaterials`, `Attendances`, `Assignments`, `AssignmentStudents`, `AssignmentQuestions`, `Submissions`, `SubmissionAnnotations`, `CommentTemplates`, `Exams`, `ExamResults`, `GradeConfigs`, `StudentReviews`, `PromotionRecommendations`, `TeacherRatings`, `TeacherRequests`, `StudentRequests`, `TeacherAvailabilities`, `OneOnOneSessions`, `Notifications`, `Announcements`.
- **Thêm 1 cột:** `Students.TargetBand` (decimal, cho phép null).
- **Không** xóa, đổi tên hay đổi kiểu cột nào của 12 bảng cũ, nên không mất dữ liệu.

## Cách làm: chạy script (khuyên dùng)

Từ gốc repo, PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1
# kèm dữ liệu demo cho teacher@demo.com:
powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -SeedDemo
```

Script `tools/db/teacher-features.ps1` tự làm các việc sau:
1. Kiểm tra `dotnet`. Thiếu `dotnet-ef` thì tự cài.
2. Đọc chuỗi kết nối trong `appsettings.json`. Nếu `appsettings.Development.json` có chuỗi riêng thì dùng chuỗi đó.
3. Nếu DB được tạo tay (có bảng `Users` nhưng `__EFMigrationsHistory` chưa ghi `InitialCreate`), hỏi rồi đánh dấu `InitialCreate` là đã áp, để EF không tạo lại bảng cũ.
4. `dotnet ef migrations add TeacherFeatures` (bỏ qua nếu đã có).
5. Soát file migration: **dừng lại** nếu thấy `DropTable`, `DropColumn`, `Rename…` hoặc `AlterColumn` trên bảng cũ.
6. Hỏi xác nhận, rồi chạy `dotnet ef database update`.
7. Kiểm tra bảng `ClassSessions` đã có.
8. Nếu có `-SeedDemo`: chạy API một lần với `--Database:InitializeOnStartup=true` để seed syllabus, bài nộp mẫu, ngân hàng nhận xét. Thấy dòng `Now listening on` thì bấm Ctrl+C.

## Máy chưa có database `EnglishCenterDb` (lỗi `Cannot open database`)

Có sẵn bản backup DB của nhóm: `tools/db/EnglishCenterDb.bak` (SQL Server 2025, 12 bảng `InitialCreate`, `__EFMigrationsHistory` đã ghi `InitialCreate`, tài khoản demo admin / teacher / teacher2 / student / student2 `@demo.com`, mật khẩu `123456`).

```powershell
# từ gốc repo
powershell -ExecutionPolicy Bypass -File tools\db\restore-db.ps1              # khôi phục backup
powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -SeedDemo
```
`teacher-features.ps1` cũng tự phát hiện DB chưa có và hỏi restore. Nếu SQL Server cũ hơn 2025 (không restore được backup), dùng:
```powershell
powershell -ExecutionPolicy Bypass -File tools\db\teacher-features.ps1 -CreateFresh -SeedDemo
```
(EF tạo DB mới từ `InitialCreate` + `TeacherFeatures`, rồi seed tài khoản demo.)

Đã soát (2026-11-02): schema trong backup khớp 100% `InitialCreate` + snapshot; khác biệt với code chỉ là 22 bảng Teacher + `Students.TargetBand`, nên migration sinh ra chỉ gồm `CreateTable` + `AddColumn`. Cấu hình xóa trong `AppDbContext.Teacher.cs` dùng `Restrict` ở các nhánh có thể gây "multiple cascade paths".

## Làm tay (nếu không dùng script)

```sql
-- SSMS, trên EnglishCenterDB
SELECT * FROM __EFMigrationsHistory;
-- Nếu KHÔNG có 20261019064930_InitialCreate mà bảng Users đã tồn tại:
IF OBJECT_ID('__EFMigrationsHistory') IS NULL
    CREATE TABLE __EFMigrationsHistory (MigrationId nvarchar(150) PRIMARY KEY, ProductVersion nvarchar(32) NOT NULL);
INSERT INTO __EFMigrationsHistory VALUES ('20261019064930_InitialCreate', '10.0.13');
```
```powershell
cd app\backend\EnglishCenter.Api\EnglishCenter.Api
dotnet ef migrations add TeacherFeatures
# mở Migrations\*_TeacherFeatures.cs: chỉ được có CreateTable + AddColumn TargetBand
dotnet ef database update
```

## Sau khi xong
- [ ] Commit `Migrations/*_TeacherFeatures.cs`, `*_TeacherFeatures.Designer.cs`, `AppDbContextModelSnapshot.cs`
- [ ] Cập nhật `docs/admin/DB-CAN-LAM.md` (bỏ dòng "thiếu bảng TeacherPortal") và `docs/BAN-GIAO.md`
- [ ] Báo nhóm: `git pull` rồi `dotnet ef database update`
- [ ] Máy mới chưa có DB: `dotnet ef database update`, rồi chạy `dotnet run -- --Database:InitializeOnStartup=true` một lần để seed

## Tiêu chí hoàn thành
- [ ] `GET /api/teacher/dashboard` (token `teacher@demo.com`) trả 200
- [ ] `GET /api/student/dashboard` (token `student@demo.com`) trả 200
- [ ] Dữ liệu cũ (khóa, lớp, GV, HV, phiếu thu) còn nguyên
- [ ] `dotnet build` xanh
