# 00 — Tạo và commit migration `TeacherFeatures`

- **Loại:** plan
- **Vùng:** Teacher (ảnh hưởng mọi người)
- **Người làm:** Duy
- **Phụ thuộc:** —
- **Độ khó:** Thấp

## Mục tiêu
DB hiện chỉ có 12 bảng của `InitialCreate`. Các bảng chức năng Teacher (`ClassSessions`, `Attendances`, `Assignments`, `Submissions`, `Exams`, `Notifications`… khai báo trong `Data/AppDbContext.Teacher.cs`) **chưa có migration**.
Hậu quả: `Program.cs` gọi `TeacherSeeder` lúc khởi động sẽ lỗi, nên cả API không chạy được.
Tạo **một** migration, commit lên để cả nhóm dùng chung, không ai phải tự tạo.

## Đọc trước khi làm
- `.claude/context/backend.md` (mục Entity & migration)
- `app/backend/EnglishCenter.Api/EnglishCenter.Api/Data/AppDbContext.Teacher.cs`
- `app/backend/EnglishCenter.Api/EnglishCenter.Api/Migrations/` (chỉ có `20261019064930_InitialCreate`)

## Các task theo thứ tự

### Task 1: Cài công cụ EF (nếu máy chưa có)
- [ ] `dotnet tool install --global dotnet-ef` (đã có thì `dotnet tool update --global dotnet-ef`)
- Kiểm tra: `dotnet ef --version`

### Task 2: Tạo migration
- [ ] Đứng ở `app/backend/EnglishCenter.Api/EnglishCenter.Api/`
- [ ] `dotnet ef migrations add TeacherFeatures`
- Bẫy: nếu ai đó đã tạo migration tên khác ở nhánh của họ thì **thống nhất trước**, chỉ giữ một.
- Kiểm tra: thư mục `Migrations/` có thêm `*_TeacherFeatures.cs`, `*.Designer.cs`, và `AppDbContextModelSnapshot.cs` thay đổi.

### Task 3: Áp vào DB local và chạy thử
- [ ] `dotnet ef database update`
- [ ] `dotnet run`, rồi thử `POST /api/auth/login` với `teacher@demo.com` / `123456` và `GET /api/teacher/dashboard` (dùng `Teacher.http`)
- Kiểm tra: dashboard trả 200, có dữ liệu demo (syllabus, bài Writing chờ chấm…)

### Task 4: Commit và báo nhóm
- [ ] Commit cả 3 file migration. Message: `feat(be): add TeacherFeatures migration`
- [ ] Nhắn nhóm: "pull về rồi chạy `dotnet ef database update`"

## Tiêu chí hoàn thành
- [ ] `Migrations/` có `TeacherFeatures`, đã push lên main
- [ ] DB mới tạo từ đầu (`dotnet ef database drop` rồi `update`) chạy `dotnet run` không lỗi
- [ ] `GET /api/teacher/dashboard` trả 200
