# Public course consultation correction

Reviewer: review_course_rules

**PASS.**

CTA mở form tư vấn cho cả khách và tài khoản đã đăng nhập, tự điền đúng khóa học và gửi qua endpoint Consultations hiện có. Form chỉ báo thành công sau khi API trả thành công; lỗi giữ nội dung đã nhập, retry giữ SubmissionId để tránh trùng.

Dialog xử lý focus/Escape và chặn đóng khi đang gửi; Admin được thông báo làm mới sau khi lưu. Không thấy mục chặn trong các file sửa cho yêu cầu này.
