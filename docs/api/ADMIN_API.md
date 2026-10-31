# API chức năng Admin

Tất cả cần token của tài khoản **admin** (`[Authorize(Roles = "admin")]`). Quy ước chung xem [README.md](./README.md).
Doc này được **tổng hợp từ code hiện tại** (`Controllers/Admin/`). Ví dụ request đầy đủ: `EnglishCenter.Api.http`.

## 1. Khóa học: `api/admin/courses`

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/courses?search=&page=1&pageSize=16` | Danh sách (phân trang) |
| GET | `/api/admin/courses/{id}` | Chi tiết |
| POST | `/api/admin/courses` | Tạo. 409 "Tên khóa học đã tồn tại" |
| PUT | `/api/admin/courses/{id}` | Sửa. 409 trùng tên |
| DELETE | `/api/admin/courses/{id}` | Xóa. 409 "Khóa học đã có lớp, không thể xóa" |

```json
{ "name": "IELTS 6.5", "description": "...", "bandFrom": 5.0, "bandTo": 6.5,
  "totalSessions": 30, "sessionsPerWeek": 3, "tuition": 4000000, "discountPercent": 10 }
```
Luật: band 0–9 bước 0.5, `bandFrom ≤ bandTo`, `sessionsPerWeek` 1–7 và ≤ `totalSessions`, giảm giá 0–50%.

## 2. Lớp học: `api/admin/classes`

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/classes?courseId=&teacherId=&status=Upcoming\|Ongoing\|Finished&page=1&pageSize=10` | Danh sách (phân trang), có `enrolledCount` |
| GET | `/api/admin/classes/{id}` | Chi tiết + lịch tuần + học viên |
| POST | `/api/admin/classes` | Tạo lớp + lịch tuần. Bỏ trống `endDate` thì tự tính theo `totalSessions`. 409 nếu trùng phòng / trùng lịch GV |
| PUT | `/api/admin/classes/{id}` | Sửa. 409 "Lớp đã có học viên ghi danh, không thể đổi khóa học", 409 nếu `maxStudents` < số đang học |
| DELETE | `/api/admin/classes/{id}` | Xóa. 409 nếu đã có ghi danh |
| POST | `/api/admin/classes/{id}/students` | Thêm học viên: `{ "studentId" }` (dùng `EnrollmentService`) |
| DELETE | `/api/admin/classes/{id}/students/{enrollmentId}` | Rút học viên |

```json
{ "name": "IELTS 6.5 - Tối 3-5", "courseId": 1, "teacherId": 1, "startDate": "2026-11-03",
  "endDate": null, "maxStudents": 15, "meetingUrl": "https://meet.google.com/...",
  "schedules": [ { "dayOfWeek": 2, "startTime": "18:00:00", "endTime": "20:00:00", "roomId": 1 } ] }
```
Luật: ít nhất 1 lịch/tuần, giờ bắt đầu < giờ kết thúc, các dòng lịch không trùng nhau.

## 3. Phòng học: `api/admin/rooms`

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/rooms` | Tất cả (không phân trang) `[{ id, name, capacity }]` |
| GET | `/api/admin/rooms/{id}` | Chi tiết |
| POST | `/api/admin/rooms` | `{ "name": "P101", "capacity": 25 }` → 201. 409 trùng tên |
| PUT | `/api/admin/rooms/{id}` | Sửa. 409 trùng tên |
| DELETE | `/api/admin/rooms/{id}` | 204. 409 "Phòng đang được dùng trong lịch học, không thể xóa" |

## 4. Học viên: `api/admin/students`

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/students?search=&status=Studying\|OnHold\|Dropped&page=1&pageSize=10` | Tìm theo tên / SĐT / mã HV |
| GET | `/api/admin/students/{id}` | Chi tiết + các ghi danh |
| POST | `/api/admin/students` | Tạo học viên + tài khoản. 409 "Email đã được sử dụng" |
| PUT | `/api/admin/students/{id}` | Sửa hồ sơ (không đổi email) |
| DELETE | `/api/admin/students/{id}` | 409 nếu đã có ghi danh / phiếu thu (chuyển trạng thái `Dropped` thay vì xóa) |
| POST | `/api/admin/students/{id}/reset-password` | `{ "newPassword" }` (≥ 6 ký tự) |
| POST | `/api/admin/students/{id}/lock` · `/unlock` | Khóa / mở tài khoản (khóa thì token cũ bị thu hồi) |
| POST | `/api/admin/students/{id}/enrollments` | Ghi danh `{ "classId" }` |
| DELETE | `/api/admin/students/{id}/enrollments/{enrollmentId}` | Rút khỏi lớp |

```json
{ "fullName": "Phạm Văn D", "phone": "0900000004", "email": "hv@demo.com", "dateOfBirth": "2008-05-20",
  "address": "...", "parentName": "...", "parentPhone": "...", "status": "Studying", "tempPassword": "123456" }
```

## 5. Giáo viên: `api/admin/teachers`

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/teachers?search=&specialty=&status=Teaching\|OnLeave&page=1&pageSize=10` | Danh sách |
| GET | `/api/admin/teachers/{id}` | Chi tiết + lớp phụ trách |
| POST | `/api/admin/teachers` | Tạo GV + tài khoản. 409 trùng email |
| PUT | `/api/admin/teachers/{id}` | Sửa |
| DELETE | `/api/admin/teachers/{id}` | 409 nếu đang phụ trách lớp (chuyển `OnLeave`) |
| POST | `/api/admin/teachers/{id}/reset-password` · `/lock` · `/unlock` | Như học viên |

```json
{ "fullName": "Lê Văn C", "phone": "0900000003", "email": "gv@demo.com", "specialty": "IELTS",
  "degree": "IELTS 8.0, TESOL", "hireDate": "2026-01-10", "status": "Teaching", "tempPassword": "123456" }
```

## 6. Đơn giáo viên — đã gỡ khỏi Admin

Theo yêu cầu ngày 2026-10-31, đã xóa GET /api/admin/teacher-requests và POST approve/reject. Không còn controller hay API thay thế cho chức năng duyệt đơn trong Admin. Entity/DB và luồng gửi đơn của cổng Giáo viên vẫn còn; không có migration hay xóa dữ liệu trong thay đổi này.

## 7. Cài đặt: `api/admin/settings`

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/settings/center` | Thông tin trung tâm `{ name, logoUrl, address, phone }` |
| PUT | `/api/admin/settings/center` | `{ "name", "address", "phone" }` |
| POST | `/api/admin/settings/change-password` | `{ "currentPassword", "newPassword", "confirmPassword" }` (≥ 6 ký tự). 400 "Mật khẩu hiện tại không đúng" |

---

## CHƯA CÓ (backlog)

| Nhóm | Plan |
|---|---|
| Blog `api/admin/posts`, ảnh trang chủ `api/admin/homepage-images` | [plans/21](../../plans/21-be-admin-blog-trang-chu.md) |
| Dashboard `api/admin/dashboard`, báo cáo `api/admin/reports/*` | [plans/22](../../plans/22-be-admin-bao-cao.md) |

## 8. Học phí: `api/admin/payments` — đợt 1

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/payments?page=1&pageSize=10&search=` | Phiếu thu: PaidDate mới nhất trước, Id giảm dần nếu cùng ngày; tìm chứa tên/mã HV bằng Vietnamese_CI_AI. |
| POST | `/api/admin/payments` | Tạo phiếu đóng đủ một lần, BE tính số tiền. |
| GET | `/api/admin/payments/{id}` | Dữ liệu biên lai, cấu hình trung tâm và người lập. |
| GET | `/api/admin/students/{id}/payments` | Lịch sử và tổng đã đóng của một HV. |
| GET | `/api/admin/classes/available?search=` | Lớp còn chỗ và giá cho ghi danh mới. |

GET trả `{ items: [{ id, enrollmentId, studentId, studentCode, studentName, classId, className, courseName, tuitionFee, discountPercent, discountAmount, amount, paidDate, method }], total, totalItems, page, pageSize, totalPages }`. Giá/giảm giá lấy snapshot ghi danh. Page mặc định 1, pageSize mặc định 10, tối đa 100; page quá lớn trả items rỗng. Không có PUT/DELETE phiếu thu.

`PagedResult` dùng chung thêm `total = totalItems`; giữ `totalItems`, `totalPages` và field cũ cho Teacher/Admin. Các field danh sách khóa/lớp/HV/GV còn thiếu được theo dõi trong ADMIN-TRACKER.

### Tạo phiếu — 6.3.1

`POST /api/admin/payments` trả 201, Location `/api/admin/payments/{id}`, body là PaymentResponse như danh sách.

```json
{ "studentId": 1, "classId": 1, "method": "Cash", "paidDate": "2026-10-30", "note": "Đã xác nhận nhận đủ tiền" }
```

Hoặc `{ "enrollmentId": 1, "method": "Transfer" }`. Chỉ gửi một cách xác định ghi danh. Bỏ paidDate/null thì dùng AppTime.Today. Method bắt buộc đúng Cash/Transfer; note tối đa 500 ký tự. Không có field amount trong request; BE luôn lấy FinalTuitionFee đã chốt lúc ghi danh, không lấy giá khóa hiện tại. Admin chỉ gọi POST sau khi xác nhận đã nhận tiền.

Lỗi: 401 token/claim thiếu; 404 không có ghi danh; 409 đã có phiếu (kể cả tạo đồng thời nhờ unique EnrollmentId); 400 ghi danh không Active, ngày tương lai hoặc DTO sai. Giao dịch bao gồm đọc ghi danh và lưu phiếu. Validation DTO còn ProblemDetails hiện tại (B3.f xử lý đợt 5); lỗi nghiệp vụ có message tiếng Việt.

Giới hạn DB: Amount phải > 0, nên ghi danh miễn phí hiện trả 400, không tự tạo phiếu. Phần này ⏸ chờ quyết định trong DB-CAN-LAM.md.

### Biên lai — 6.4.1

`GET /api/admin/payments/{id}` trả `{ payment: PaymentResponse, center: { name, logoUrl, address, phone }, createdByUserId, createdByName, createdByEmail, note }`. payment có học viên/mã, lớp/khóa, tuitionFee, discountPercent, discountAmount, amount, method, paidDate. Giá là snapshot ghi danh; center lấy cấu hình hiện tại Id=1. Không trả entity/User/password/hash.

404 nếu phiếu không tồn tại hoặc chưa có cấu hình trung tâm (message phân biệt). Giới hạn: User admin chưa có họ tên, nên createdByName tạm bằng createdByEmail. Phần họ tên ⏸ chờ DB-CAN-LAM.md; không coi email là tên thật.

### Lịch sử học phí học viên — 4.6.3

`GET /api/admin/students/{id}/payments` trả `{ items: [PaymentResponse], totalPaid }`, sắp PaidDate DESC, Id DESC. Tổng tính từ cùng danh sách trả về; gồm tất cả phiếu đã đóng kể cả ghi danh đã rút (Dropped). Không phân trang. HV tồn tại chưa có phiếu: `{ items: [], totalPaid: 0 }`; HV không tồn tại: 404 message.

### Lớp còn chỗ — phần 4.5.1

`GET /api/admin/classes/available?search=` trả mảng `[{ id, name, courseId, courseName, enrolled, capacity, tuition, discountPercent, finalTuition }]`, theo tên lớp rồi Id. Chỉ Upcoming/Ongoing (EndDate >= AppTime.Today), enrolled = số Enrollment.Active, enrolled < capacity. Tìm chứa tên lớp/khóa bằng Vietnamese_CI_AI. Không phân trang, không có kết quả trả `[]`.

Giá là giá hiện tại của khóa dành cho ghi danh mới; finalTuition = tuition - Round(tuition * discountPercent / 100, 2), cùng cách làm tròn với EnrollmentService. Phiếu thu vẫn dùng snapshot giá cũ. Endpoint này chọn lớp để ghi danh; form thu tiền lấy ghi danh chưa thu từ chi tiết HV hiện có. Route ghi danh chuẩn còn thiếu, xem tracker.

## FE Admin (2026-10-30)

Các trang FE hiện gọi đúng API đã có: teachers, students, courses, classes, rooms, payments và settings. /admin/users chuyển hướng sang /admin/students. Email update và logo upload chưa được FE gửi vì BE chưa hỗ trợ. Dashboard/Blog/Reports vẫn có nhãn minh họa. Chi tiết route, chạy thử và giới hạn: [FE-ADMIN.md](../admin/FE-ADMIN.md).
