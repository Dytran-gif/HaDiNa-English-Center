# Bỏ mã lớp và link học online — 2026-11-27

- Form tạo/sửa lớp chỉ còn tên lớp, khóa học, giáo viên, ngày học, sĩ số và lịch/phòng học. Không gửi `code` hoặc `meetingUrl`.
- Entity `CourseClass` và bảng `Classes` không còn `Code`, `MeetingUrl`; bỏ cả unique index `IX_Classes_Code` và bộ sinh mã lớp. Mã học viên và mã khóa học là các trường khác, vẫn giữ.
- API lớp Admin/Teacher/Student trả `id` và `name`. Các API tham chiếu lớp (ghi danh, lịch, học phí, đánh giá, bài tập) dùng `classId` và `className`, thay `classCode`. Public `open_classes` trả `id/name`; đánh giá public dùng `class_name`. FE đã cập nhật cùng hợp đồng; cần triển khai FE/BE đồng thời.
- Quan hệ DB vẫn theo ID: lớp, lịch, ghi danh, phiếu thu không bị tạo lại hoặc đổi ID. Tìm kiếm lớp dùng tên lớp/khóa học. Không còn nút/link vào phòng online ở cả ba vai trò.

## Migration và DB hiện tại

- Migration `20261127075745_RemoveClassCodeAndMeetingUrl` chỉ bỏ hai cột và index mã lớp; không xóa dòng dữ liệu. Migration cũ giữ nguyên để lịch sử EF tiếp tục chạy được.
- Đã sao lưu COPY_ONLY/CHECKSUM và RESTORE VERIFYONLY trước khi áp dụng trên `EnglishCenterDB` local. Backup: `EnglishCenterDB_before_remove_class_fields_20261127.bak` trong thư mục backup mặc định của SQL Server.
- Sau migration và dọn dữ liệu QA: 13 Classes, 20 Enrollments, 18 ClassSchedules, 19 Payments, bằng trước khi thay đổi. Kiểm tra sys.columns xác nhận hai cột đã mất.
- `Down` chỉ phục hồi cấu trúc, tạo mã duy nhất `LOP-{Id}` để lập lại unique index. Muốn phục hồi giá trị mã/link cũ phải dùng backup trước thay đổi.

## Kiểm tra

- FE lint/typecheck/build và BE build; lint chỉ còn hai cảnh báo Fast Refresh có sẵn.
- API thật: đọc cả 13 lớp và chi tiết, tạo/sửa lớp không cần mã/link; học viên thử ghi danh theo ClassId thành công, các API lịch/học phí/ghi danh/khóa học trả tên lớp, không còn field cũ.
- API giáo viên: lớp, chi tiết, lịch, dashboard; Admin: học phí/công nợ, học viên, giáo viên, đánh giá, dashboard; public: khóa học và đánh giá đều trả thành công.
- Các dòng QA đã xóa. Chưa thực hiện kiểm tra giao diện bằng trình duyệt cho thay đổi này.
