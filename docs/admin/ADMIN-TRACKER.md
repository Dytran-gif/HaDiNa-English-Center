# ADMIN TRACKER

Cập nhật lần cuối: 2026-10-30 — đợt 1

Đợt tiếp theo: Đợt 2 — Dashboard (plan 22); hai phần Payments chờ DB không chặn số liệu thu dương.

⬜ chưa làm · 🔵 đang làm · ✅ xong (build xanh, API doc khớp) · ⚠️ một phần · ⏸ chờ DB/người khác.

Đối chiếu code 2026-10-30; baseline dotnet build: 0 cảnh báo, 0 lỗi. Chỉ đánh giá backend.

| Mã task | Tên | BE | File / endpoint | Ghi chú, quyết định, phần thiếu |
|---|---|---|---|---|
| 1.1 | Ba nút lối tắt | ✅ | POST students/classes/payments | Đủ API tạo dùng chung; không cần API riêng. Mở form là phần FE ngoài phạm vi. |
| 1.2 | Hiển thị 4 KPI card | ⬜ | GET dashboard/kpis | Chưa có controller/endpoint. |
| 1.3 | Biểu đồ doanh thu theo tháng | ⬜ | GET dashboard/revenue-by-month | Chưa có controller/endpoint. |
| 1.4 | Biểu đồ học viên mới theo tháng | ⬜ | GET dashboard/new-students-by-month | Chưa có controller/endpoint. |
| 1.5.1 | Danh sách lớp có lịch dạy trong ngày | ⬜ | GET dashboard/today-classes | Chưa có controller/endpoint. |
| 1.5.2 | Tóm tắt trong ngày | ⬜ | GET dashboard/today-classes | Chưa có controller/endpoint. |
| 1.6.1 | Bảng lớp sắp đầy | ⬜ | GET dashboard/almost-full-classes | Chưa có controller/endpoint. |
| 2.1.1 | Hiển thị lưới card, 4 card mỗi hàng | ⚠️ | GET courses; CourseResponse | CoursesController: thiếu currentStudents/maxStudents/finalTuition; có activeStudents/finalPrice. |
| 2.1.2 | Phân trang, 16 khóa mỗi trang | ⚠️ | GET courses; PagedResult | total alias đã thêm, mặc định 16; skip cũ dùng int có thể tràn với trang rất lớn, cần rà ở đợt 5. |
| 2.2.1 | Ô tìm kiếm theo tên khóa | ⚠️ | GET courses?search= | GET courses: Contains, chưa collation CI_AI. |
| 2.3.1 | Form thêm khóa học | ⚠️ | POST courses; CourseRequest | POST courses: có band/số buổi/giá/trùng tên; lỗi DTO còn ProblemDetails. |
| 2.4.1 | Sửa khóa học | ⚠️ | PUT courses/{id} | PUT courses: giữ snapshot cũ, không tự đổi lịch lớp cũ; lỗi theo trường chưa chuẩn hóa. |
| 2.4.2 | Xóa khóa học | ⚠️ | DELETE courses/{id} | DELETE courses: có chặn, thiếu số lớp trong message. |
| 3.1.1 | Bảng danh sách giáo viên có phân trang | ⚠️ | GET teachers; TeacherResponse | GET teachers: có classCount; thiếu isAccountLocked (có isLocked). |
| 3.2.1 | Ô tìm kiếm theo tên | ⚠️ | GET teachers?search= | GET teachers: chưa collation CI_AI. |
| 3.2.2 | Lọc theo chuyên môn và trạng thái | ⚠️ | GET teachers; teachers/specialties | GET teachers: thiếu specialties; status sai chưa 400. |
| 3.3.1 | Form thêm giáo viên | ⚠️ | POST teachers; TeacherCreateRequest | POST teachers: User+Teacher atomic, email unique; mật khẩu mới 6, SĐT chưa validate định dạng. |
| 3.4.1 | Sửa giáo viên | ⚠️ | PUT teachers/{id}; TeacherUpdateRequest | PUT teachers: DTO thiếu email; SĐT chưa validate định dạng. |
| 3.4.2 | Xóa giáo viên | ⚠️ | DELETE teachers/{id} | DELETE teachers: chặn/gợi ý OnLeave, thiếu số lớp. |
| 3.5.1 | Hồ sơ và bằng cấp | ✅ | GET teachers/{id} | GET teachers/{id}: có hồ sơ, bằng cấp và isLocked. |
| 3.5.2 | Danh sách lớp phụ trách | ⚠️ | GET teachers/{id}/classes | Chi tiết GV có lớp cơ bản; thiếu GET teachers/{id}/classes, schedule/sĩ số/filter. |
| 3.6.1 | Đặt lại mật khẩu | ⚠️ | POST teachers/{id}/reset-password | reset-password: hash và tăng TokenVersion, tối thiểu mới 6. |
| 3.6.2 | Khóa / Mở tài khoản | ✅ | POST teachers/{id}/lock, unlock | teachers lock/unlock: khóa tăng TokenVersion, auth hiện có xử lý. |
| 4.1.1 | Bảng danh sách có phân trang | ⚠️ | GET students; StudentResponse | GET students: chỉ currentClass một lớp; thiếu currentClasses. |
| 4.2.1 | Tìm theo tên / SĐT / mã | ⚠️ | GET students?search= | GET students: có tên/SĐT/mã; thiếu collation. |
| 4.2.2 | Lọc theo trạng thái | ⚠️ | GET students?status= | GET students: status sai chưa 400. |
| 4.3.1 | Form thêm học viên | ⚠️ | POST students; StudentCreateRequest | POST students: atomic, mã unique; mật khẩu mới 6, SĐT chưa validate định dạng. |
| 4.4.1 | Sửa thông tin học viên | ⚠️ | PUT students/{id}; StudentUpdateRequest | PUT students: DTO thiếu email; SĐT chưa validate định dạng. |
| 4.4.2 | Xóa học viên | ⚠️ | DELETE students/{id} | DELETE students: chặn/gợi ý Dropped; B3.j yêu cầu số lượng. |
| 4.5.1 | Ghi danh học viên vào lớp | ⚠️ | EnrollmentService; GET classes/available | Lớp còn chỗ + giá đã xong, build xanh/doc khớp. Còn thiếu route POST enrollments chuẩn (đợt 5). |
| 4.6.1 | Thông tin cá nhân | ✅ | GET students/{id} | GET students/{id}: đủ hồ sơ, phụ huynh và isLocked. |
| 4.6.2 | Các lớp đã/đang học | ⚠️ | GET students/{id}/enrollments | Chi tiết có enrollments; thiếu GET riêng và DELETE theo classId/studentId. |
| 4.6.3 | Lịch sử học phí | ✅ | GET students/{id}/payments | items + totalPaid, kể cả ghi danh Dropped; 404 nếu HV không tồn tại; build xanh/API doc khớp. |
| 4.7.1 | Đặt lại mật khẩu | ⚠️ | POST students/{id}/reset-password | reset-password: hash/thu hồi token, tối thiểu mới 6. |
| 4.7.2 | Khóa / Mở tài khoản | ✅ | POST students/{id}/lock, unlock | students lock/unlock: khóa tăng TokenVersion. |
| 5.1.1 | Bảng danh sách lớp có phân trang | ⚠️ | GET classes; ClassResponse | GET classes: thiếu schedule chuỗi/enrolled/capacity; có field cũ. |
| 5.1.2 | Lọc theo khóa, giáo viên, trạng thái | ✅ | GET classes?courseId=&teacherId=&status= | GET classes: kết hợp courseId/teacherId/status, status sai trả 400. |
| 5.2.1 | Form tạo lớp | ⚠️ | POST classes; ClassRequest | POST classes: chưa bắt buộc GV Teaching; Url chưa giới hạn http/https; lỗi chưa chuẩn hóa. |
| 5.2.2 | Lịch học có cấu trúc (nhiều buổi mỗi tuần) | ⚠️ | ScheduleService; ClassRequest | ScheduleService/ClassRequest: có phòng/chống trùng; thiếu warnings lệch sessionsPerWeek. |
| 5.3.1 | Sửa lớp | ⚠️ | PUT classes/{id} | PUT classes: có kiểm tra sĩ số; còn thiếu sót 5.2. |
| 5.3.2 | Xóa lớp | ⚠️ | DELETE classes/{id} | DELETE classes: có chặn/cascade lịch, thiếu số HV trong message. |
| 5.4.1 | Thông tin lớp và lịch học | ✅ | GET classes/{id} | GET classes/{id}: có lịch/phòng/sĩ số/link/trạng thái. |
| 5.4.2 | Danh sách học viên của lớp, thêm và xóa khỏi lớp | ⚠️ | GET classes/{id}/students; POST/DELETE enrollments | Chi tiết có HV; thiếu GET students riêng và route enrollments chuẩn. |
| 6.1.1 | Bảng phiếu thu có phân trang | ✅ | GET payments | DTO + total; PaidDate DESC/Id DESC, build xanh, API doc cập nhật. |
| 6.2.1 | Tìm theo học viên | ✅ | GET payments?search= | Helper AdminSearch, tên/mã HV Vietnamese_CI_AI; build xanh, ToQueryString dịch SQL thành công; cần test DB thật. |
| 6.3.1 | Form tạo phiếu thu | ⏸ | POST payments | Phần thu dương đã viết/build xanh/doc khớp: snapshot, transaction, token, Active, duplicate 409, ngày. Chờ DB cho phiếu miễn phí (DB-CAN-LAM). |
| 6.4.1 | Biên lai | ⏸ | GET payments/{id} | Đã có center/logo/địa chỉ/snapshot/người lập bằng email, build xanh/doc khớp. Chờ DB bổ sung tên admin thật (DB-CAN-LAM). |
| 7.1.1 | Danh sách bài viết | ⬜ | GET posts | Chưa có controller/endpoint. |
| 7.1.2 | Thêm và sửa bài viết | ⬜ | POST/PUT posts | Chưa có controller/endpoint. |
| 7.1.3 | Xóa hoặc ẩn bài viết | ⬜ | DELETE/PUT posts/{id} | Chưa có controller/endpoint. |
| 7.2.1 | Thư viện hình ảnh (banner/gallery) | ⬜ | homepage-images; homepage-images/order | Chưa có controller/endpoint. |
| 7.3.1 | API công khai cho trang chủ | ⬜ | GET public/posts, public/homepage-images | Chưa có controller/endpoint. |
| 8.1.1 | Form đổi mật khẩu | ⚠️ | POST settings/change-password | settings/change-password: thiếu route account, tối thiểu mới 6, chưa chặn giống cũ. |
| 8.2.1 | Xem và cập nhật thông tin trung tâm | ⚠️ | GET/PUT settings/center | settings/center: có GET/PUT; thiếu upload logo/validate SĐT. |
| 8.3.1 | Danh sách và thêm phòng học | ✅ | GET/POST rooms | GET/POST rooms: required/unique/sức chứa dương. |
| 8.3.2 | Sửa và xóa phòng học | ⚠️ | PUT/DELETE rooms/{id} | PUT/DELETE rooms: thiếu warning giảm sức chứa và số lớp đang dùng. |

## Quyết định đã chốt
- Chỉ làm tiếp dòng chưa ✅; không sửa frontend/auth/schema/migrations hoặc teacher-requests ngoài spec.
- Lớp đang mở = Upcoming + Ongoing (EndDate >= AppTime.Today). Giá phiếu lấy snapshot ghi danh.
- Giữ field cũ, chỉ thêm Total alias; đổi số buổi khóa không tự cập nhật lịch lớp cũ.
- Tự review theo code-reviewer như người dùng yêu cầu.

## Sai khác còn tồn đọng so với spec
- B3.a–k theo ghi chú từng dòng; DTO validation toàn hệ thống vẫn ProblemDetails, chưa có message/errors chuẩn.
- AppTime dùng giờ máy chủ; hạ tầng cần giờ Việt Nam. Tìm kiếm cũ chưa CI_AI.
- User admin thiếu họ tên, Payments chặn Amount = 0: xem DB-CAN-LAM.md.

## Việc cần người khác làm
- Chuẩn bị SQL Server/schema hiện có; kiểm thử tích hợp sau khi DB sẵn sàng.
- Chốt phiếu miễn phí và họ tên người lập; xem DB-CAN-LAM.md. Agent không sửa migration.

## Ghi chú FE — 2026-10-30
Plan 23 đã thêm trang và nối các API hiện có; xem FE-ADMIN.md. Trạng thái BE trong bảng không thay đổi bởi công việc FE. Dashboard/Blog/Reports, email update và upload logo vẫn chờ BE.
