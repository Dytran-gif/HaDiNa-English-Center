# ADMIN TRACKER

Cập nhật lần cuối: 2026-10-30 — audit lượt 1/3 (Page 1–2)

Đợt tiếp theo: Đợt 2 — Dashboard (plan 22); hai phần Payments chờ DB không chặn số liệu thu dương.

⬜ chưa làm · 🔵 đang làm · ✅ xong (build xanh, API doc khớp) · ⚠️ một phần · ⏸ chờ DB/người khác.

Đối chiếu code 2026-10-30; baseline dotnet build: 0 cảnh báo, 0 lỗi. Chỉ đánh giá backend.

| Mã task | Tên | BE | File / endpoint | Ghi chú, quyết định, phần thiếu |
|---|---|---|---|---|
| 1.1 | Ba nút lối tắt | ✅ | D:11; RP:67 (students); Fpages/admin/Classes/ClassesManagement.tsx:53; Fpages/admin/Payments/PaymentsManagement.tsx:36; BControllers/Admin/StudentsController.cs:14/:179; BControllers/Admin/ClassesController.cs:14/:187; BControllers/Admin/PaymentsController.cs:16/:53 | audit 2026-10-30 — Không cần API dashboard riêng. Ba link có action=create; các trang đích đọc query để mở form khi mount. POST có quyền admin. Chưa test thao tác trình duyệt/DB. |
| 1.2 | Bốn KPI | ❌ | BProgram.cs:97 + kiểm kê controller ở Tóm tắt; S:4/:10/:11/:13/:14/:16 | audit 2026-10-30 — Thiếu GET dashboard/kpis. FE là số mock: khóa, giáo viên, học viên, blog; thiếu lớp đang mở/doanh thu tháng, không lọc Studying; không API/skeleton/lỗi --. |
| 1.3 | Doanh thu 12 tháng | ❌ | BProgram.cs:97 + kiểm kê; D:8 (toàn hàm chỉ actions/KPI/recent) | audit 2026-10-30 — Không endpoint revenue-by-month, không chuỗi tháng liên tục/zero-fill; Dashboard không có biểu đồ, đơn vị tiền/loading/lỗi. |
| 1.4 | Học viên mới 12 tháng | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không endpoint new-students-by-month; không biểu đồ theo ngày tạo học viên/loading/lỗi. |
| 1.5.1 | Lớp có lịch hôm nay | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không today-classes; thiếu chọn theo thứ/ngày lớp, giờ/GV/phòng/sĩ số/sức chứa/sắp giờ; FE không danh sách/link chi tiết. |
| 1.5.2 | Tổng lớp hôm nay | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không totalToday trong response; FE không phần tóm tắt. |
| 1.6.1 | Lớp sắp đầy | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không almost-full-classes threshold/limit; không lọc tỷ lệ kể cả vừa đầy; FE không progress/link. |
| 2.1.1 | Lưới 4/2 card | ⚠️ | CC:12/:26/:39/:49/:69; BDtos/Admin/CourseResponse.cs:16/:18; BDtos/Common/PagedResult.cs:5; CFG:12/:14; RP:64/:97/:98/:99 | audit 2026-10-30 — GET mặc định16, có items/total/page/pageSize và quyền admin; thiếu currentStudents/maxStudents. activeStudents đếm enrollment Active ở lớp chưa kết thúc, không phải field hợp đồng. FE gọi API thật nhưng bảng, không grid/sĩ số tối đa/sessionsPerWeek/badge giảm giá/skeleton; detail mở modal. finalTuition là tùy chọn nên không tính thiếu bắt buộc. |
| 2.1.2 | Phân trang 16 khóa | ⚠️ | CC:49/:51/:65; BDtos/Common/PagedResult.cs:7; CFG:13; RP:58/:73/:104; Fpages/admin/Components/Ui/Pagination.tsx:7 | audit 2026-10-30 — BE pageSize16 và total alias đúng, nhưng Skip((page-1)*pageSize) int có thể tràn, không bảo đảm trang cực lớn trả rỗng. FE lưu page URL nhưng hiện pager cả <=16 và không scroll-top; trang vượt phạm vi thông thường hiển thị rỗng. |
| 2.2.1 | Tìm tên khóa | ❓ | CC:57/:60/:63; Fpages/admin/Components/Api/SearchField.tsx:8/:13; RP:73/:91/:98 | audit 2026-10-30 — BE Contains, total sau lọc đúng; không explicit CI_AI, collation thực DB chưa kiểm chứng nên không kết luận kết quả chắc chắn sai. FE debounce300ms/reset page/URL có; không nút xóa riêng, type=search có thể có native clear tùy browser, chưa QA; empty chưa đúng câu spec. |
| 2.3.1 | Thêm khóa | 🔶 | CR:13/:16/:25/:32; CC:90/:95/:110/:113; BProgram.cs:65; CFG:15; RP:78/:81/:85/:106/:107/:109; Fpages/admin/Components/Api/AdminUi.tsx:3; Fservices/apiClient.ts:35 | audit 2026-10-30 — BE đủ phần lớn Range/so sánh, POST201 và kiểm tra trùng409. BandFrom/BandTo/Tuition non-nullable mặc định0 nên không phân biệt bỏ trường bắt buộc với nhập0; 409 chỉ message, không lỗi name. FE có form/HTML validation/chặn busy/đóng/reload; band là number thay dropdown; không preview giá trong form, không hiển thị lỗi từng trường/validate so sánh phía FE; thành công Notice thay toast. DTO400 có errors mặc định ApiController, không khẳng định thiếu mọi lỗi theo trường ở BE. |
| 2.4.1 | Sửa khóa | 🔶 | CC:117/:120/:126/:129/:135; CR:13/:25; BServices/EnrollmentService.cs:52/:60; RP:74/:76/:86/:106/:108 | audit 2026-10-30 — BE có PUT/404/trùng tên, giữ snapshot giá ghi danh; còn thiếu Required số/lỗi409 theo trường như tạo. Không tự sửa lịch lớp cũ; tác động số buổi cần người chốt. FE reuse/prefill đúng, thiếu nhắc chỉ ghi danh mới, field errors và toast; form còn thiếu như 2.3.1. |
| 2.4.2 | Xóa khóa | ⚠️ | CC:146/:149/:154/:155; RP:80/:81/:96/:101; Fpages/admin/Components/Api/AdminUi.tsx:3 | audit 2026-10-30 — BE404/409 khi có bất kỳ lớp đúng, nhưng message không nêu số lớp. FE có confirm, lỗi server, reload và lùi trang khi xóa dòng cuối; thành công Notice thay toast. |
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

## Audit 2026-10-30 — phạm vi và nhãn
- Page 1–2 đã kiểm chứng lại; Page 3–8 giữ trạng thái lịch sử, chưa audit lượt này.
- Nhãn audit: ✅ khớp qua code; ⚠️ lệch; ❌ thiếu; 🔶 một phần; ⏸ bị chặn; ❓ chưa kiểm chứng. Nhãn này thay nghĩa ⚠️ cũ ở các dòng 1.x/2.x.
- Các quyết định cũ về lớp đang mở và lịch lớp cần người dùng xác nhận theo mục Cần người chốt trong AUDIT-ADMIN.md; không coi audit là phê duyệt.
- finalTuition tùy chọn; total đã có alias. Không ghi hai trường này là bắt buộc còn thiếu.
- Build BE PASS 0 warning/0 error; chưa chạy DB/API. Xem AUDIT-ADMIN.md để đọc phạm vi chứng cứ.

## Quyết định 2026-10-31 — gỡ API đơn giáo viên Admin

- Theo yêu cầu mới, đã xóa TeacherRequestsController (GET list, POST approve/reject). Quyết định này thay thế chủ trương giữ BE teacher-requests trước đây.
- FE Admin và API giả tương ứng cũng đã gỡ. Entity TeacherRequest, dữ liệu cũ, SessionService và luồng gửi đơn của TeacherPortal vẫn dùng chung nên giữ; không migration/xóa dữ liệu.
- Thông báo mới từ TeacherPortal không gắn link đến route Admin đã xóa. Không còn giao diện/API Admin xử lý các đơn Pending; chưa có luồng thay thế.

## [2026-10-31] Plan27 — sửa lỗi BE và bổ sung API Dashboard

- KPI/revenue-by-month đã có controller admin, DTO và doc/http; giữ AppTime và PaidDate làm nguồn. Không đánh dấu xong dashboard học viên mới/lớp sắp đầy.
- Khóa/GV/HV/lớp phân trang tránh tràn; Khóa/GV/HV tìm CI_AI. Tạo/reset/đổi mật khẩu8, trùng mật khẩu cũ bị400. Course JSON nhận biết thiếu band/tuition, errors.name409/race; chặn xóa báo số lớp.
- AppTime UTC+7 độc lập server; ảnh hưởng Teacher/Student, không hồi tố dữ liệu. Program bỏ2 đăng ký middleware lặp.
- BuildPASS0warning/error,17 kiểm tra BE không DB, SQL ToQueryString PASS. Chưa thực thi SQL Server. Các dòng audit2026-10-30 là lịch sử, xem reports/27-fs-admin-review-implementation.md.
