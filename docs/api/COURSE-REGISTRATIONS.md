# Đăng ký khóa học → Admin xếp lớp — 2026-11-27

> Cập nhật nút public sau yêu cầu sửa lại: website mở form thông tin và gửi ConsultationRequests → Admin Yêu cầu tư vấn, không dẫn đến tạo tài khoản hay quản lý đăng ký. Xem `PUBLIC-COURSE-CONSULTATION.md`. Luồng API Student dưới đây vẫn được giữ cho cổng học viên, không xóa dữ liệu đã phát sinh.

## Quy trình

1. Website hiển thị nhiều lớp của cùng khóa, mỗi lớp có lịch/giáo viên/sĩ số riêng; không còn nút đăng ký từng lớp. Các cột khai giảng, giáo viên và còn chỗ căn cùng hàng. Đội ngũ giảng dạy liệt kê tất cả hồ sơ public liên quan thay vì người đầu tiên.
2. Trong cổng Student, học viên có thể xác nhận gửi yêu cầu khóa học. Nút đăng ký ngoài website hiện dùng form tư vấn riêng, theo cập nhật phía trên.
3. Yêu cầu Pending hiện trong Khóa của tôi — Chờ xếp lớp. Chưa tạo Enrollment, không chiếm chỗ, chưa tạo phiếu thu. Học phí tại bước này là tham khảo, giá/ưu đãi được chốt theo BE khi Admin ghi danh.
4. Admin vào Đào tạo → Đăng ký khóa học, chọn Xếp lớp. Chỉ liệt kê các lớp còn chỗ thuộc đúng khóa, kèm tên giáo viên. Không có lớp thì Admin tạo lớp rồi quay lại xử lý.
5. API kiểm tra đúng khóa, sĩ số, lịch trùng và học viên hợp lệ. Tạo Enrollment và đổi Pending → Assigned cùng transaction; Student thấy lớp/giáo viên/lịch/học phí trong Khóa của tôi. Chọn nhóm Sắp học được mặc định đúng sau khi dữ liệu tải về.

Một khóa có nhiều lớp và mỗi lớp có giáo viên riêng. Admin vẫn có thể ghi danh thủ công từ hồ sơ học viên/lớp; nếu có yêu cầu Pending khớp khóa thì được chuyển Assigned trong cùng giao dịch.

## API

| Vai trò | API | Hành vi |
|---|---|---|
| Student | GET `/api/student/course-registrations` | Chỉ danh sách của chính mình, gồm Pending/Assigned/Cancelled |
| Student | POST `/api/student/course-registrations` `{ courseId }` | Tạo Pending trả201; yêu cầu Pending trùng trả200 cùng ID, không tạo thêm dòng |
| Student | DELETE `/api/student/course-registrations/{id}` | Hủy Pending của mình, trả204; yêu cầu người khác404, đã xử lý409 |
| Admin | GET `/api/admin/course-registrations?status=Pending&page=1&pageSize=10` | Phân trang theo Pending/Assigned/Cancelled; ẩn hồ sơ học viên đã xóa |
| Admin | POST `/api/admin/course-registrations/{id}/assign` `{ classId }` | Xếp lớp, trả200 với enrollmentId; sai khóa400, lớp không tồn tại404, hết chỗ/trùng lịch/đã xử lý409 |
| Student (cũ) | POST `/api/student/enrollments` `{ classId }` | Trả403: không được tự chọn/ghi danh lớp qua API cũ |

GET enrollments/điểm danh/học phí vẫn dùng Enrollment đã xếp lớp, không trộn với yêu cầu chờ. Hủy ghi danh tương lai theo luật cũ vẫn được hỗ trợ và đổi request Assigned tương ứng sang Cancelled. Xóa học viên hủy các Pending trong cùng transaction, giữ các lịch sử còn lại.

API list không cache. Các màn hình liên quan làm mới sau mutation, khi focus hoặc nhận storage event giữa các tab. Không có websocket/polling giữa các thiết bị.

## DB và an toàn

- Migration `20261127093719_CourseRegistrationRequests` thêm bảng CourseRegistrations, không sửa/di chuyển/backfill các Enrollment/Payment cũ.
- Fields: Id, StudentId, CourseId, Status, CreatedAt, ClassId nullable, AssignedAt nullable. Unique filtered index chỉ cho một Pending trên cặp StudentId/CourseId; trạng thái chỉ Pending/Assigned/Cancelled.
- FK Student/Course Restrict bảo toàn lịch sử; Class SetNull khi xóa lớp đủ điều kiện. Khóa đã có yêu cầu đăng ký không bị xóa vật lý, API trả409 để giữ lịch sử.
- StudentLifecycle lock nối yêu cầu/hủy/ghi danh/xóa học viên. ClassLifecycle lock nối xếp lớp/sửa/xóa lớp. Dữ liệu lớp/khóa/lịch/giá được đọc lại trong transaction; không dùng snapshot đọc trước transaction để đối chiếu course ID hoặc giá.
- Đã backup COPY_ONLY/CHECKSUM và RESTORE VERIFYONLY trước khi áp dụng local: `EnglishCenterDB_before_course_registration_20261127.bak` trong thư mục backup mặc định SQL Server. Cần triển khai FE/BE và migration cùng nhau. Down xóa bảng yêu cầu, nên cần backup trước nếu đã có dữ liệu.

## Xác minh

- 38 kiểm tra API: Pending không chiếm chỗ/ghi danh, chống trùng đồng thời, phạm vi sở hữu/quyền Admin, chặn endpoint cũ, sai khóa/lớp thiếu/lớp đầy, nhiều lớp cùng khóa, khóa ẩn, hủy rồi đăng ký lại, ghi danh Admin thủ công, xóa học viên hủy Pending, hủy/xếp lớp đồng thời và xếp lớp/sửa khóa của lớp đồng thời.
- 14 kiểm tra Chrome headless: căn nhãn/giá trị và cột qua nhiều lớp, không có CTA từng lớp, nhiều giáo viên, giữ lựa chọn qua đăng nhập, gửi yêu cầu, Admin chọn lớp đúng khóa, Student thấy lớp đã xếp, không có exception trình duyệt.
- VerifyAdmin 40 checks; FE lint/typecheck/build và BE build đạt (cảnh báo Fast Refresh/bundle cũ).
- Đã dọn sáu học viên QA, sáu lớp, hai khóa và mọi yêu cầu/ghi danh QA bằng các ID/tên/email kiểm chứng. Dữ liệu gốc vẫn 4 Students, 20 Enrollments, 19 Payments. Một yêu cầu thật phát sinh từ phiên khác trong lúc kiểm tra được giữ nguyên; không truncate bảng đăng ký.
