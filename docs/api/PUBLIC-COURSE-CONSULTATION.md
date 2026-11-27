# Nút đăng ký khóa học public → Yêu cầu tư vấn — 2026-11-27

## Xóa yêu cầu sau khi tư vấn

`DELETE /api/admin/consultations/{id}` chỉ dành cho Admin (JWT role `admin`). Trả 204 khi xóa thành công, 404 `{message}` nếu không còn bản ghi, 401/403 nếu chưa đăng nhập/không đúng quyền. Xóa vĩnh viễn đúng bản ghi ConsultationRequests; không ảnh hưởng User, Student, Enrollment hay Payment. Không cần migration.

Admin → Yêu cầu tư vấn có nút Xóa màu đỏ, xác nhận tên người gửi, khóa gửi lặp khi đang xử lý, giữ thông báo lỗi khi thất bại và làm mới danh sách/tổng số sau khi thành công. API list tự điều chỉnh trang nếu xóa bản ghi cuối trang. Request mẫu: `Consultations.http`.

Theo yêu cầu sửa lại, nút trong trang chi tiết khóa học là form để lại thông tin, không phải liên kết quản lý/đăng ký tài khoản.

- Mọi vai trò và khách chưa đăng nhập đều thấy **Đăng ký khóa học**. Bấm mở dialog ngay trên trang; “Cần tư vấn thêm” mở cùng form.
- Thu họ tên, điện thoại, email và tự điền khóa học đang xem (readonly). Gửi `submissionId/fullName/phone/email/courseSlug/courseName` qua POST `/api/public/consultations` hiện có.
- Lưu tại ConsultationRequests và hiển thị tại Admin → Yêu cầu tư vấn (`/admin/consultations`). Không tạo User/Student, CourseRegistration, Enrollment hay Payment từ form public này.
- Homepage và chi tiết khóa dùng chung ConsultationForm. API lỗi giữ bản nháp, chỉ hiện thành công sau khi BE xác nhận; GUID giữ nguyên khi retry và đổi khi người dùng thay nội dung/gửi yêu cầu khác. Lỗi không tạo thông báo thành công giả.
- Dialog native hỗ trợ focus, Escape, khóa đóng khi đang gửi; tải lại catalog khi focus không unmount form đang điền. Admin list làm mới bằng event/storage/focus sau khi gửi thành công.
- Không migration, không chuyển/xóa các yêu cầu hay dữ liệu đã có. Các yêu cầu trong cổng học viên từ bước triển khai trước được giữ nguyên; chỉnh sửa này chỉ thay nút đăng ký ngoài website sang đúng nơi tiếp nhận tư vấn.

Kiểm tra Chrome/API: 13 ca đạt, gồm khách và Admin, đúng khóa, giữ bản nháp khi gửi lỗi, retry không trùng, đối chiếu DB/API và dòng trong trang Yêu cầu tư vấn, form chung homepage, không exception trình duyệt. Yêu cầu QA đã dọn theo SubmissionId/tên/email chính xác. FE lint/typecheck/build đạt; chỉ có hai cảnh báo Fast Refresh và bundle-size warning cũ.
