# Xóa học viên đã khóa hoặc nghỉ học — 2026-11-27

## Điều kiện và hành vi

- `DELETE /api/admin/students/{id}` chỉ dành cho Admin. Cho phép nếu `User.IsLocked == true` **hoặc** `Student.Status == Dropped`, bất kể đã ghi danh/đóng học phí. Học viên chưa khóa đang Studying/OnHold trả 409.
- Xóa khỏi danh sách nghiệp vụ bằng `Students.DeletedAt`, không xóa vật lý quan hệ lịch sử. Danh sách/chi tiết/sửa/mở khóa/reset mật khẩu và ghi danh mới không còn truy cập hồ sơ đã xóa; trả 404. Xóa lặp trả 404, không trừ sĩ số thêm lần nữa.
- Trong một transaction: tất cả ghi danh của học viên chuyển Dropped, các phiếu Pending chuyển Rejected với lý do, khóa tài khoản và tăng TokenVersion. Phiếu Confirmed, biên lai, lịch sử thanh toán/hoàn tiền, điểm danh/bài nộp giữ nguyên.
- Sĩ số lớp và số học viên khóa học vốn tính từ ghi danh Active nên tự giảm theo dữ liệu thật, không dùng phép trừ thủ công. Roster Admin/Teacher ẩn học viên đã xóa. Lịch sử điểm danh vẫn đọc được; dòng của học viên đã xóa chỉ để xem, không gửi kèm khi lưu các dòng còn lại.
- Login, JWT validation và cổng Student đều chặn hồ sơ đã xóa kể cả có thao tác mở khóa chạy đồng thời. Không có chức năng khôi phục trong thay đổi này. Email/mã học viên vẫn dành cho hồ sơ lịch sử, không được tái sử dụng tự động.
- API thu thêm/ghi danh/rút ghi danh không được làm sống lại hoặc xóa mất lịch sử của hồ sơ đã xóa; hoàn tiền từ phiếu đã xác nhận vẫn theo quy trình hiện có.

## Đồng bộ và an toàn

- `StudentLifecycle.LockAsync` khóa dòng Student trong transaction của xóa/cập nhật/mở khóa/ghi danh/rút ghi danh/tạo phiếu thu/yêu cầu chuyển khoản/xác nhận chuyển khoản. Những thao tác đến trước khi xóa có thể hoàn tất; sau khi xóa không sinh thêm Pending hoặc đăng nhập lại được.
- Admin list/profile/lớp/khóa/dashboard và public catalog làm mới sau mutation, focus hoặc storage event giữa các tab.
- Không dùng global query filter trên Student: các phép join lịch sử học phí/doanh thu vẫn đọc được dữ liệu cũ.

## Migration và kiểm tra

- `20261127084005_ArchiveDeletedStudents` chỉ thêm cột datetime2 nullable `DeletedAt`; các hồ sơ có sẵn mặc định NULL. Đã backup COPY_ONLY/CHECKSUM, RESTORE VERIFYONLY và áp dụng local EnglishCenterDB. Backup `EnglishCenterDB_before_archive_students_20261127.bak` trong thư mục backup SQL mặc định.
- API kiểm tra: Studying/OnHold chưa khóa bị chặn; Dropped chưa khóa và OnHold đã khóa xóa được dù có ghi danh; nhiều lớp cập nhật đúng sĩ số; xóa lặp và xóa đồng thời không trừ hai lần; chặn unlock/edit/enroll/withdraw sau xóa; token cũ bị thu hồi; thu thêm/xác nhận Pending bị chặn; biên lai vẫn đọc được.
- Đã kiểm tra ba lượt chạy đồng thời xóa/xác nhận/yêu cầu chuyển khoản/mở khóa theo thứ tự khác nhau: không lỗi server, không có Pending sau xóa, tài khoản vẫn bị chặn, sĩ số bằng 0.
- Sáu học viên QA, hai lớp/khóa QA và mọi ghi danh/phiếu QA đã được dọn bằng ID/email/tên kiểm chứng. Các phiếu Confirmed gốc và metadata/giá khóa học giữ nguyên. Trong lúc test có thao tác xóa hồ sơ thực tế ID1 từ phiên sử dụng khác; giữ nguyên thay đổi đó, không phục hồi đè dữ liệu người dùng.
- FE lint/typecheck/build và BE build đạt; VerifyAdmin 29 checks đạt, không có model change thiếu migration. Lint có hai cảnh báo Fast Refresh cũ; Vite có bundle warning cũ.
- Không đổi điều kiện xóa lớp/khóa học trong phần việc này.
