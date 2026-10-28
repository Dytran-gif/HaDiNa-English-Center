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

## 6. Đơn của giáo viên: `api/admin/teacher-requests`

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/admin/teacher-requests?status=Pending&type=Leave\|Reschedule\|AttendanceUnlock` | Danh sách đơn |
| POST | `/api/admin/teacher-requests/{id}/approve` | `{ "note" }`. Nghỉ/đổi buổi: hủy buổi cũ, tạo buổi bù (nếu có đề xuất), báo học viên. Mở điểm danh: cho sửa trong 24 giờ. 409 nếu đã xử lý / trùng phòng / trùng lịch |
| POST | `/api/admin/teacher-requests/{id}/reject` | `{ "reason" }` (bắt buộc) |

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
| Học phí / thanh toán `api/admin/payments` | [plans/20](../../plans/20-be-admin-hoc-phi.md) |
| Blog `api/admin/posts`, ảnh trang chủ `api/admin/homepage-images` | [plans/21](../../plans/21-be-admin-blog-trang-chu.md) |
| Dashboard `api/admin/dashboard`, báo cáo `api/admin/reports/*` | [plans/22](../../plans/22-be-admin-bao-cao.md) |
