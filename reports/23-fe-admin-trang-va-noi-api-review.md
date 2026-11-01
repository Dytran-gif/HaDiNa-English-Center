# Code Review — 23-fe-admin-trang-va-noi-api

**Kết luận:** PASS trong phạm vi FE tương thích API hiện có; còn chờ xác minh trình duyệt/DB.

## Đã kiểm tra và sửa

- Không gọi fetch trong page; token đi từ AuthContext qua service. Không có token không gọi API/không fallback lưu giả. 401 logout, 403 giữ thông báo; phiên demo cũ đọc được.
- Cài đặt dùng settings/change-password và confirmPassword đúng BE; cập nhật token mới. Email update không gửi vì BE chưa hỗ trợ. Không có nút upload logo giả.
- Ghi danh/rút dùng student/{id}/enrollments/{enrollmentId} và classes/{id}/students/{enrollmentId} hiện hữu; không giả định route enrollments chuẩn đã có.
- Số tiền thu lấy snapshot ghi danh và chỉ đọc; request không chứa amount, chỉ gửi sau xác nhận người dùng. Không tạo PUT/DELETE payments.
- Sửa button trong các form thành type=button cho thao tác phụ, tránh submit form vô tình khi thêm/xóa lịch hoặc tải lại.
- Trang cuối danh sách chỉ lùi sau xóa, không tự lùi sau sửa/khóa/reset.
- Tải hết trang danh mục khóa/GV cho dropdown lớp thay vì âm thầm cắt 100 lựa chọn. Tìm HV khi tạo phiếu có thông báo thu hẹp kết quả nếu trên 100.
- Query có abort để tránh dữ liệu cũ ghi đè; URL chứa search/status/page/filter; lịch DateOnly/TimeOnly không đổi sang UTC.
- Ảnh logo chỉ nhận đường dẫn /uploads hoặc http/https; không render HTML nội bộ hoặc password/hash.
- Giữ route /admin/users bằng redirect; trang demo chưa có BE có nhãn minh họa.
- Lint/typecheck/build PASS và 27 kiểm tra service/server-render PASS. Không thêm npm package hoặc sửa BE.

## Thông tin cần biết

- [INFO] Sửa file dùng chung auth/routes/vite/types đã ghi Ảnh hưởng vùng khác trong plan; 6 lỗi baseline được sửa ở import/export, không đổi luồng Student.
- [INFO] Lint còn 1 warning Fast Refresh của AuthContext như baseline, không có lỗi.
- [INFO] Chưa có browser host/native pipe nên chưa QA hình ảnh hoặc tương tác. SSR/build không thay thế kiểm thử trình duyệt và DB.
- [INFO] Production cần reverse proxy hoặc CORS với VITE_API_URL, dev proxy chỉ áp dụng khi npm run dev.

Không phát hiện lỗi chặn còn lại qua kiểm tra code/contract đã thực hiện. Các giới hạn BE được ghi rõ, không báo toàn bộ Admin đã hoàn tất.
