# Class rename review

Reviewer: review_course_rules

**PASS về code.**

Nhánh bỏ kiểm tra xung đột chỉ áp dụng khi giáo viên, ngày bắt đầu/kết thúc và toàn bộ lịch/phòng đều giữ nguyên. Đổi giờ, ngày, phòng hoặc giáo viên vẫn kiểm tra xung đột; đổi sĩ số vẫn kiểm tra sức chứa và số học viên hiện có. Validation DTO và kiểm tra khóa học/giáo viên vẫn chạy.

Giữ nguyên ID lịch khi chỉ đổi tên là hợp lý. Không thấy đường bypass mới; cần hoàn tất kiểm tra API thực tế cho ca đổi tên và ca tạo xung đột trước khi chốt.

Validation bổ sung: API đổi tên trên lịch QA chồng nhau đã đạt, ID lịch giữ nguyên; kiểm tra tạo/đổi lịch gây trùng vẫn trả409, Force không vượt qua. QA đã dọn; VerifyAdmin 36 checks đạt.
