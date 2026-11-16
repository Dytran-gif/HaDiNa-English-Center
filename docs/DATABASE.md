# Database — nằm ở đâu, gồm những gì

> Cập nhật 14/11/2026. Dự án dùng **EF Core Code-First**. Schema chuẩn là **DB chung của nhóm** (`tools/db/EnglishCenterDb.bak`, bản của Hải, 14 bảng) + bảng `Attendances` cho điểm danh = **15 bảng**. Bỏ toàn bộ bảng riêng khác của Teacher.
> Muốn đổi bảng: sửa **Entity + `AppDbContext`** → tạo **migration** (chỉ 1 người) → commit. Người khác `git pull` + `dotnet run` là DB tự cập nhật. **Không tạo bảng bằng tay trong SSMS** (máy khác sẽ không có).

## 0. Tự dựng database (không cần migration tay)

Chạy API ở Development (`dotnet run`, hoặc profile `http`/`https` trong Visual Studio), `Data/DatabaseBootstrapper.cs` làm lần lượt, phần nào có rồi thì bỏ qua:

1. **Máy chưa có DB** → restore `tools/db/EnglishCenterDb.bak` (có sẵn dữ liệu của nhóm). Restore không được (SQL Server cũ hơn 2025, SQL Server không đọc được file…) thì EF tạo DB trống.
2. **Sửa DB cũ**: DB tạo tay chưa ghi `InitialCreate` thì ghi nhận. Máy từng chạy migration Teacher cũ có bảng `Assignments` / `Attendances` kiểu Teacher → đổi tên thành `Assignments_TeacherOld` / `Attendances_TeacherOld` (giữ dữ liệu, xóa tay sau nếu không cần).
3. **Áp migration còn thiếu** (chỉ thêm bảng/cột, không xóa dữ liệu).
4. **DB chưa có user** → tạo `admin / teacher / student @demo.com`, mật khẩu `123456`.

Cấu hình: `Database:AutoSetup` (mặc định bật ở Development), `Database:BackupFile` (đổi file .bak). Tắt: `dotnet run -- --Database:AutoSetup=false`.

Lỗi thường gặp: *Cannot connect to SQL Server* → SQL Server chưa chạy hoặc chuỗi kết nối sai (`appsettings.json` → `ConnectionStrings:Default`; máy dùng SQL Express thì `Server=localhost\\SQLEXPRESS`). Muốn lấy lại dữ liệu chung từ đầu: xóa DB `EnglishCenterDb` trong SSMS rồi `dotnet run`.

## 1. Những chỗ cần biết

| Ở đâu | Là gì |
|---|---|
| `app/backend/EnglishCenter.Api/EnglishCenter.Api/appsettings.json` → `ConnectionStrings:Default` | Chuỗi kết nối, mặc định `Server=localhost;Database=EnglishCenterDb;Trusted_Connection=True;TrustServerCertificate=True;` |
| `.../Entities/*.cs` | Mỗi class = một bảng (riêng `AssignmentFile` → bảng `Assignments`) |
| `.../Data/AppDbContext.cs` (+ `AppDbContext.Student.cs`) | Danh sách bảng và luật: độ dài cột, khóa ngoại, index, CHECK |
| `.../Migrations/` | Lịch sử schema. `AppDbContextModelSnapshot.cs` = ảnh chụp schema hiện tại |
| `tools/db/EnglishCenterDb.bak` | DB chung của nhóm (SQL Server 2025), được restore tự động khi máy chưa có DB. `restore-db.ps1` để restore tay |
| `wwwroot/uploads/...` | File upload (bài tập, bài nộp, ảnh đại diện). DB chỉ lưu đường dẫn |

## 2. Migration hiện có

| Migration | Nội dung |
|---|---|
| `20261019064930_InitialCreate` | 12 bảng gốc |
| `20261114065932_StudentModuleTables` | `Assignments` (file bài tập/bài nộp) + `StudentFeedbacks`. Hai bảng này trước được tạo tay, nên migration viết `IF NOT EXISTS`: DB đã có thì chỉ bổ sung cột/index thiếu |
| `20261114073637_AddAttendances` | Bảng `Attendances` (điểm danh theo ngày học) |

Migration `TeacherFeatures` và `StudentFeedbackAndSubmissionFile` **đã bỏ** (22 bảng Teacher không còn trong code).

## 3. Các bảng (15)

| Nhóm | Bảng |
|---|---|
| Tài khoản | `Users` (email, mật khẩu BCrypt, `Role` admin/teacher/student, `TokenVersion`) · `Teachers` · `Students` (1 user ↔ 1 hồ sơ) |
| Khóa & lớp | `Courses` · `Classes` (khóa, giáo viên, ngày, sĩ số) · `ClassSchedules` (thứ, giờ, phòng) · `Rooms` |
| Ghi danh & học phí | `Enrollments` · `Payments` |
| Học tập | `Assignments`: `FileType='Teacher'` = file bài GV giao (`StudentId` NULL), `FileType='Student'` = bài HV nộp (`AssignmentId` = bài gốc), `CourseId` = khóa · `StudentFeedbacks` (GV nhận xét HV theo lớp) |
| Điểm danh | `Attendances`: 1 dòng = 1 học viên · 1 lớp · 1 ngày học (unique `ClassId, StudentId, Date`), `Status` Present/Late/Absent/Excused, `Note`. Ngày học tính từ `ClassSchedules`, không có bảng buổi học. Xóa lớp/học viên thì xóa theo |
| Trang công khai | `Posts` · `HomepageImages` · `CenterSettings` (1 dòng, `Id = 1`) |

DB của Hải còn 2 bảng `Notifications`, `Announcements` tạo tay, **chưa có trong code/migration**. Khi cần dùng thì thêm entity + migration để máy khác cũng có.

## 4. Xem DB bằng mắt

1. SSMS → Server `localhost` → *Windows Authentication* → Connect.
2. *Databases* → `EnglishCenterDb` → *Tables* → chuột phải → *Select Top 1000 Rows*.
3. `SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;` — phải có đủ 3 dòng ở mục 2.

## 5. Lệnh hay dùng (PowerShell, thư mục `app\backend\EnglishCenter.Api\EnglishCenter.Api`)

| Việc | Lệnh |
|---|---|
| Chạy API + tự dựng/cập nhật DB | `dotnet run` |
| Tạo migration khi đổi entity (1 người) | `dotnet ef migrations add <Ten>` rồi commit `Migrations/` |
| Kiểm tra code và snapshot khớp nhau | `dotnet ef migrations has-pending-model-changes` (phải *No changes*) |
| Chạy mà không đụng DB | `dotnet run -- --Database:AutoSetup=false` |
