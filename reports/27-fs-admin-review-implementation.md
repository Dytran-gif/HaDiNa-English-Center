# Báo cáo thực hiện: Rà soát kết nối Admin FE/BE

Plan: [27](../plans/27-fs-admin-review.md) · Ngày: 2026-10-31 · Vùng: Admin + giờ nghiệp vụ dùng chung.

## Kết quả

| Nhóm | Trước | Sau |
|---|---|---|
| Dashboard/Báo cáo | Nhập số mẫu từ data/localStorage, không phản ánh phiếu/học viên trên BE | KPI và doanh thu12tháng qua API có quyền Admin, SUM theo PaidDate, zero-fill, lỗi không biến thành0, có retry. CSV chỉ doanh thu đang xem. |
| Phân trang | Nhân int trước Skip ở4 controller, trang rất lớn có thể lỗi | Helper dùng long, trang vượt phạm vi trả rỗng; FE reset URL về trang hợp lệ và ẩn pager khi không cần. |
| Tìm kiếm | Contains phụ thuộc collation DB | Courses/Teachers/Students dùng helper Vietnamese_CI_AI đã có; status sai có400 rõ ràng. |
| Khóa học | Trường số có thể thiếu nhưng mặc định0; lỗi409 chỉ message; form không gắn errors | JsonRequired phân biệt thiếu/0; name409 có errors (kể cả unique race), xóa báo số lớp; FE map Pascal/camel field, dropdown band, preview và nhắc snapshot. |
| Mật khẩu | FE8/BE6, BE nhận đổi trùng cũ | Tạo/reset/đổi mới đều8, lỗi NewPassword khi trùng cũ; không đổi hash/demo login cũ. |
| Giờ nghiệp vụ | AppTime lệ thuộc timezone server, FE chọn ngày VN | AppTime UTC+7 cố định, DateTime Unspecified; không hồi tố timestamp. |
| Kiểm tra/hạ tầng | Kiểm tra UI đòi11menu cũ; middleware lặp | 10route duy nhất, xác nhận không có đơn GV; bỏ HTTPS/AuthZ đăng ký lặp. |

## File chính

- BE: Controllers/Admin/{AdminPaging,DashboardController,CoursesController,StudentsController,TeachersController,ClassesController}.cs; Dtos/Admin/{DashboardResponse,CourseRequest,ChangePasswordRequest,TeacherCreateRequest,StudentCreateRequest}.cs; Dtos/Common/ResetPasswordRequest.cs; Program.cs; Services/SessionService.cs.
- FE: Components/Api/{ResourcePage,resourceConfigs}; Dashboard/Components/StatsOverview; Reports; AdminLayout; types/adminApi; scripts mock/verify và verify-ui.
- Kiểm tra BE không DB: tools/VerifyAdmin/VerifyAdmin.csproj, Program.cs. Không thêm NuGet/npm package.
- Hợp đồng: docs/api/ADMIN_API.md và Admin.http. Không schema/entity/migration hay dữ liệu thật thay đổi.

## Validation

| Lệnh | Kết quả |
|---|---|
| npm run build | PASS |
| npm run typecheck | PASS |
| npm run lint | 0 lỗi, 1 warning react only-export-components có sẵn ở AuthContext.tsx:53 |
| node scripts/verify-admin.mjs | 28 PASS, service/error/auth/SSR render |
| node src/pages/admin/Blog/verify-blog.mjs | 16 PASS |
| node src/pages/admin/Components/Ui/verify-ui.mjs | 28 PASS |
| dotnet build --no-restore | PASS, 0 warning/error |
| dotnet run --project tools/VerifyAdmin/VerifyAdmin.csproj --no-restore --no-launch-profile | 17 PASS: DTO, JsonRequired, boundary, quyền endpoint, SQL translation, zero-fill/cross-year; không mở kết nối DB |
| Mock HTTP local5174 | KPI78HV/16lớp/13GV; tháng190.370.000, tổng1.209.470.000; revenue12tháng 2025-11→2026-10 khớp KPI; months0=>400, không token=>401, teacher-requests=>404 |
| git diff --check | PASS |

89 kiểm tra tự động đạt. Các kiểm tra SSR không thay thế tương tác trình duyệt; mock HTTP không chứng minh API ASP.NET chạy với SQL Server.

## Review

Reviewer theo code-reviewer: PASS, xem [27-fs-admin-review-review.md](27-fs-admin-review-review.md). Hai lỗi reviewer phát hiện (pager kẹt trang vượt phạm vi, chart tràn mobile) đã sửa và review lại.

## Phạm vi và giới hạn

- Không tuyên bố toàn bộ project/8 page đã hoàn tất. Đây là sửa các lỗi kết nối Admin xác định được trong đợt này; không triển khai lại tất cả feature thiếu trong audit.
- User chưa có họ tên Admin; bảng thông tin và biên lai không thể lấy tên thật từ BE hiện tại. Giữ Chưa cập nhật/email, cần schema/hồ sơ được nhóm DB chốt.
- Blog còn lưu demo, chưa có posts/upload/gallery API; DB chặn phiếu0; chưa có dashboard học viên mới/lớp sắp đầy và layout card khóa theo toàn spec.
- Lớp đang mở giữ cùng EndDate>=today như code cũ (Upcoming+Ongoing), không tự chọn quy tắc mới thay người dùng. Lịch hôm nay vẫn theo ClassSchedules, chưa xử lý lịch nghỉ/bù từ ClassSession trong widget.
- Đơn giáo viên đã gỡ Admin theo yêu cầu; TeacherPortal vẫn gửi/lưu đơn nhưng không còn Admin duyệt, chưa có luồng thay thế được chốt.
- AppTime ảnh hưởng Teacher/Student: đã thông báo trong plan/handoff; không đổi ngày giờ đã lưu. Dữ liệu lịch sử lưu bằng timezone cũ cần người phụ trách DB xác minh.
- Không khởi động ASP.NET vì Program tự migrate/seed. Cần người phụ trách DB chạy integration test, concurrent create/delete, quyền JWT và QA browser trên môi trường SQL Server đã chuẩn bị.
