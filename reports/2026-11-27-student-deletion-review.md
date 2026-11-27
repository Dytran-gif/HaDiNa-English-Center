# Student deletion review

Reviewer: review_course_rules

**PASS về code sau vòng sửa.**

Bốn concerns đã được xử lý: chặn tài khoản archived tại login/JWT/Student API, khóa đồng bộ vòng đời học viên cho các thao tác liên quan, ngăn Withdraw xóa lịch sử và dùng `AppTime.Now`. Phiếu đã xác nhận vẫn được giữ; hoàn tiền lịch sử vẫn hoạt động.

Không còn mục chặn phát hiện trong diff. Cần hoàn tất các ca kiểm tra đồng thời đang chạy trước khi chốt validation.

**PASS cho luồng điểm danh thông thường.** FE giữ dòng lịch sử, khóa điều khiển và loại học viên đã xóa khỏi payload; API từ chối ID đã xóa, nên vẫn lưu được học viên còn lại.

Không có blocker mới cho chức năng xóa học viên. Nếu cần bảo đảm lịch sử chỉ đọc cả khi điểm danh chạy đồng thời Delete, cần dùng khóa vòng đời học viên trong API lưu điểm danh; kiểm tra `DeletedAt` hiện vẫn có khoảng đua trước `SaveChanges`.

Validation bổ sung từ agent triển khai: ba lượt đồng thời xóa/xác nhận/yêu cầu chuyển khoản/mở khóa đều hoàn tất không có HTTP500, không có Pending sau archive và sĩ số đúng. Không mở rộng khóa giao dịch cho chỉnh sửa điểm danh lịch sử trong phạm vi này.
