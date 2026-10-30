# Chạy thử FE Admin với BE

Cập nhật 2026-10-30. Các trang mới dùng API thật; không giả lập lưu thành công khi chưa có BE/DB.

## Chạy giao diện

Tại `app/frontend`:

```powershell
npm.cmd install  # chỉ khi chưa có node_modules
npm.cmd run dev
```

Mở URL Vite in ra (thường http://localhost:5173). Dùng `npm.cmd` nếu PowerShell chặn npm.ps1, không cần đổi ExecutionPolicy.

## Đăng nhập

- Mặc định: email/mật khẩu gửi `POST /api/auth/login`. Token nằm trong session của AuthContext, cùng khóa `ecw_auth_user`; service nhận token từ context, không tạo nơi lưu token thứ hai.
- Chưa có DB: chọn “Xem giao diện bằng tài khoản demo”, đăng nhập admin@demo.com / 123456. Có thể mở menu/form để xem cấu trúc. Danh sách thật sẽ báo cần đăng nhập máy chủ; form cấu hình trung tâm bị khóa cho tới khi tải được dữ liệu. Không hiển thị dữ liệu giả như dữ liệu thật.
- Đăng xuất xóa session; API trả 401 thì kết thúc session. 403/409/validation giữ message để người dùng xử lý. Đổi mật khẩu cập nhật token mới BE trả về vì token cũ bị thu hồi.

## Kết nối máy chủ

Vite development proxy `/api` và `/uploads` tới http://localhost:5220. Không cần thay CORS BE để thử qua Vite. Mặc định để trống VITE_API_URL để request đi cùng origin qua proxy. Nếu đặt VITE_API_URL, giá trị là origin máy chủ, không thêm /api; gọi chéo origin cần CORS từ hạ tầng.

Production không có Vite proxy: cấu hình reverse proxy /api và /uploads hoặc cấp VITE_API_URL trước khi build, kèm CORS phù hợp nếu khác origin. Không đưa mật khẩu/token vào biến môi trường FE.

Không tự chạy BE trong lần sửa này: Program.cs hiện tự MigrateAsync/seed khi khởi động. Người phụ trách DB chuẩn bị schema hiện có và cấu hình kết nối trước; không dùng thao tác chạy thử để vô tình thay schema.

## Trang và API đang dùng

| Trang | Route FE | API |
|---|---|---|
| Giáo viên | /admin/teachers | teachers CRUD/detail/reset-password/lock/unlock; lọc search/status/specialty |
| Học viên | /admin/students | students CRUD/detail/reset-password/lock/unlock; detail có enrollments, payments + totalPaid; ghi danh/rút qua route cũ được BE hỗ trợ |
| Khóa học | /admin/courses | courses CRUD, search và phân trang 16 |
| Lớp học | /admin/classes | classes CRUD/detail, lịch tuần có roomId; lọc courseId/teacherId/status; rút bằng enrollmentId |
| Đơn GV | /admin/teacher-requests | GET, POST approve/reject |
| Phòng | /admin/rooms | rooms CRUD, đúng name/capacity; bỏ phân bổ phòng theo khóa mock vì BE gắn phòng trong lịch lớp |
| Học phí | /admin/payments | payments list/search/create/receipt; chọn ghi danh Active chưa có phiếu từ students/{id}; in bằng window.print |
| Cài đặt | /admin/settings | GET/PUT settings/center, POST settings/change-password |
| Đường dẫn cũ | /admin/users | Redirect sang /admin/students |

Dashboard có lối tắt `?action=create` tới thêm HV/tạo lớp/tạo phiếu. Menu/title đã bổ sung, sidebar trên màn hình nhỏ chuyển thành hàng cuộn ngang. Nền auth/demo Teacher/Student cũ vẫn dùng được qua lựa chọn demo.

## Những giới hạn còn lại

- Dashboard, Blog và Reports chưa có API: giữ giao diện demo, có thông báo minh họa. Không gọi endpoint chưa tồn tại.
- Email không cho sửa trong form update GV/HV vì DTO BE hiện không nhận email; email có trong tạo và chi tiết.
- Logo chỉ hiển thị, chưa có upload endpoint. BE chưa có họ tên admin: biên lai tạm dùng email; phiếu học phí 0 vẫn bị chặn theo DB-CAN-LAM.md.
- Lọc chuyên môn BE hiện khớp chính xác. API teachers/specialties và GET riêng teachers/{id}/classes chưa có; trang dùng dữ liệu chi tiết BE hiện trả.
- Biên lai không có sửa/xóa phiếu; số tiền chỉ đọc từ snapshot, POST không chứa amount. Chỉ gửi khi admin tích xác nhận đã nhận đủ tiền.
- Dropdown lớp tải toàn bộ trang danh mục khóa/GV hiện có; tìm học viên tạo phiếu giới hạn 100 kết quả và yêu cầu thu hẹp từ khóa nếu nhiều hơn.
- Toàn bộ kiểm thử tích hợp với SQL Server và QA hiển thị trong trình duyệt vẫn cần làm khi DB/công cụ trình duyệt sẵn sàng.

## Kiểm tra đã chạy

`npm.cmd run lint`: PASS (1 warning Fast Refresh đã có trong AuthContext). `npm.cmd run typecheck`: PASS. `npm.cmd run build`: PASS. `node scripts/verify-admin.mjs`: 27/27 PASS (service/error/session/server render, không kết nối DB).
