# Báo cáo thực hiện: 23 — FE Admin theo BE hiện có

Ngày 2026-10-30 · Plan: plans/23-fe-admin-trang-va-noi-api.md · Vùng: Admin FE

## Đã làm

- Thêm route/menu/trang Teachers, Students, Classes, TeacherRequests và Settings. /admin/users cũ chuyển hướng sang Students.
- Nối Courses/Rooms/Payments API thật. CRUD chung có loading/error/empty, tìm kiếm debounce 300ms, lọc status/chuyên môn và phân trang URL; detail có hồ sơ/lớp/ghi danh/lịch sử thu.
- Tạo/sửa lớp với schedules cấu trúc, phòng, GV Teaching, ngày, http/https, sĩ số; cảnh báo số buổi/tuần khác khóa. Chi tiết/rút HV dùng đúng route BE hiện có; ghi danh từ chi tiết HV.
- Duyệt/từ chối đơn GV, lý do bắt buộc khi từ chối; gửi đúng approve note / reject reason.
- Cài đặt GET/PUT trung tâm, đổi mật khẩu (khác cũ, ít nhất 8, xác nhận), lưu token BE cấp lại. Logo hiện tại chỉ hiển thị vì chưa có upload endpoint.
- Payments từ ghi danh Active chưa có phiếu, giá chỉ đọc, không gửi amount, checkbox xác nhận đã nhận tiền; danh sách và biên lai in được.
- Thêm loginApi/token vào AuthContext hiện có, giữ login demo cũ, đọc được session cũ và không crash khi JSON hỏng. Login mặc định thật, checkbox demo; không tạo context/token store thứ hai.
- API client normalize cả message/ProblemDetails, AbortController chống response cũ ghi đè, 401 logout; Vite dev proxy API/uploads (không sửa CORS BE).
- Dashboard có 3 lối tắt mở form qua action=create; Dashboard/Blog/Reports ghi rõ dữ liệu minh họa vì chưa có BE.
- Sidebar cuộn khi danh sách dài, chuyển hàng ngang trên mobile; bảng có vùng cuộn ngang, CSS dùng token sẵn có. Các trang không có dữ liệu không báo lưu thành công giả.
- Sửa 6 lỗi typecheck baseline: 4 import React dư, 1 đường dẫn Course type, 1 export PageTitle thiếu. Không đổi logic Student.

## File ảnh hưởng vùng khác

AuthContext, Login, routes, vite.config, services/apiClient, types/adminApi, types/index. Bốn file Student chỉ sửa import. Không thêm dependencies hoặc đổi BE/schema/migration/auth backend/CORS. Chi tiết hướng dẫn: docs/admin/FE-ADMIN.md.

## Validation

| Lệnh | Kết quả |
|---|---|
| npm.cmd run lint | PASS; 1 warning only-export-components có sẵn ở AuthContext |
| npm.cmd run typecheck | PASS; baseline 6 lỗi đã sửa tối thiểu |
| npm.cmd run build | PASS |
| node scripts/verify-admin.mjs | 27/27 PASS |
| git diff --check | PASS |

Script verify dùng Vite SSR không mở cổng, mock fetch để kiểm tra token/JSON/204/409/400 ProblemDetails/401/network/abort/logo URL; render 8 trang và 3 form mở bằng query, chặn khách, đọc demo session cũ, xử lý JSON session hỏng. Không gọi BE/DB hoặc ghi dữ liệu thực.

## Giới hạn xác minh

Công cụ cua_repl.getState báo native pipe và browser access host unavailable. Chưa xem screenshot/test thao tác trong trình duyệt; không dùng kỹ thuật điều khiển trình duyệt khác để né giới hạn. Không chạy API vì tự migrate/seed khi khởi động. Chưa E2E với SQL Server.

## Việc còn lại

- Test CRUD/E2E với DB sẵn sàng: login/token refresh/expiry, các 409, update lịch trùng, ghi danh đầy/trùng, thu trùng và in biên lai.
- Khi BE có email update/logo upload/Dashboard/Blog/Reports, nối tiếp phần đó. Không coi các phần này đã xong trong plan 23.
- Biên lai tên admin và phiếu học phí 0 vẫn theo DB-CAN-LAM của đợt BE trước.
