# API chức năng Student (SPEC, CHƯA CODE)

> **Trạng thái: đề xuất.** Đây là hợp đồng để nhóm Student code BE (plan 10–14) và FE (plan 15) song song.
> Đổi gì thì sửa ở đây trước. Mục nào đã code xong thì đổi nhãn `⬜` thành `✅`.

Tất cả cần token của tài khoản **student**. Học viên chỉ thấy **dữ liệu của mình** và của **lớp mình đang học** (`Enrollment.Status = Active`). Quy ước chung xem [README.md](./README.md).

Dữ liệu dùng chung với Teacher (bảng nào bên nào ghi): xem mục cuối [TEACHER_API.md](./TEACHER_API.md) và `.claude/context/data-model.md`.

## 1. Dashboard ✅ (plan 10)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/dashboard` | `student` (id, code, fullName, email, avatarUrl), `nextLesson` (buổi học sắp tới **gần nhất** theo `ClassSchedules` của các lớp đang học, kèm `nextDate/startTime/endTime`; không có lịch thì lấy khóa đang học đầu tiên; không có khóa nào thì `null`), `courses` (khóa đang học theo `Enrollment.Status = Active`, shape theo `Course` trong FE `GeneralTypes.ts`), `notifications` (rỗng vì DB chưa có bảng thông báo) |

> Chỉ dùng các bảng có sẵn trong DB: `Students`, `Users`, `Enrollments`, `Classes`, `Courses` (khớp `types/StudentTypes/MainTypes/GeneralTypes.ts`). Khi DB có bảng thông báo (type `AppNotification`), gán dữ liệu vào `notifications` tại chỗ đã ghi chú trong `Controllers/Student/DashboardController.cs`.

## 2. Hồ sơ & lớp của tôi 🔵 (plan 10) — phần Hồ sơ ✅

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/profile` ✅ | `{ code, fullName, email, role, avatarUrl, phone, dateOfBirth, address, parentName, parentPhone, targetBand }` của học viên đang đăng nhập |
| PUT | `/api/student/profile` | `{ phone, address, parentName, parentPhone }` (họ tên, email, mã do Admin quản lý) |
| POST | `/api/student/profile/avatar` ✅ | multipart `file` (jpg/jpeg/png/webp ≤ 5 MB). Ảnh lưu vào `wwwroot/uploads/avatars/`, đường dẫn `/uploads/avatars/{ten}` ghi vào `Users.AvatarUrl`; **file avatar cũ bị xóa khỏi đĩa** (chỉ xóa khi đường dẫn cũ bắt đầu bằng `/uploads/avatars/` nên ảnh của tài khoản khác hay link ngoài không bị đụng). Trả `{ avatarUrl, message }`; `400` khi sai định dạng/quá cỡ/chưa chọn file |
| POST | `/api/student/profile/change-password` ✅ | `{ currentPassword, newPassword, confirmPassword }`. `400` sai mật khẩu cũ / mật khẩu mới < 8 ký tự / trùng mật khẩu cũ. Thành công: `TokenVersion++` (token cũ mất hiệu lực) và trả `{ message, token }` mới — FE dùng `replaceToken` giữ phiên |
| POST | `/api/student/profile/logout` | Tăng `TokenVersion` |
| GET | `/api/student/classes?status=Ongoing\|Upcoming\|Finished` | Lớp đã/đang học: khóa, GV, lịch tuần, `progressPercent`, `attendanceRate` |
| GET | `/api/student/classes/{id}` | Chi tiết: syllabus (bài nào đã dạy), danh sách buổi, tài liệu từng buổi, `meetingUrl`. 404 nếu không học lớp này |
| GET | `/api/student/courses` ✅ | Danh sách khóa học của trung tâm (trang Courses): mảng khóa học theo type `Course` trong FE `GeneralTypes.ts`; `imageUrl` luôn `null` vì bảng Courses chưa có cột ảnh (FE tự dùng ảnh mặc định) |
| POST | `/api/student/courses/{id}/register` ✅ | Đăng ký giả lập: tạo `Enrollment` (status `Active`, snapshot học phí từ khóa) vào **lớp đầu tiên** của khóa. `409` nếu đã có enrollment bất kỳ cho khóa này (chặn đăng ký trùng) hoặc khóa chưa có lớp. Trả `201 { id, message }` |
| GET | `/api/student/enrollments` ✅ | Các ghi danh của học viên (khối Registered Courses trang Courses): `[{ enrollmentId, status, course }]`, mới nhất trước |
| DELETE | `/api/student/enrollments/{id}` ✅ | Hủy ghi danh của chính mình. `409` nếu ghi danh **đã thanh toán** (có phiếu thu) — không cho tự hủy |

## 3. Lịch học & yêu cầu 🔵 (plan 11) — phần Lịch học ✅

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/schedule?date=YYYY-MM-DD` ✅ | Thời khóa biểu **tuần** chứa ngày `date` của học viên đang đăng nhập: `{ weekStart, weekEnd, days, sessions, notices }`. `sessions` tính từ `ClassSchedules` của các lớp đang học (Active): chỉ buổi trong khoảng `[StartDate, EndDate]` của lớp, kèm `sessionNo` (buổi thứ mấy của khóa), `teacherName`, `roomName`, `startTime/endTime` ("HH:mm"). Tuần không có buổi nào thì trả mảng rỗng. `notices` luôn rỗng vì DB chưa có bảng thông báo |
| GET | `/api/student/schedule/history` ✅ | Khóa đã qua = các ghi danh **không còn Active** (`OnHold`/`Dropped`): `[{ enrollmentId, status, registeredAt, classId, className, startDate, endDate, courseName, band, totalSessions, teacherName }]` |

> ⚠️ Giới hạn DB: chưa có bảng **semester** (học kỳ), bảng **thông báo** (AppNotification) và bảng **buổi hủy** (ClassSessions) — nên không có dữ liệu kỳ học, thông báo hủy/đổi lịch, và không đánh dấu buổi hủy trong thời khóa biểu. Khi có các bảng này thì bổ sung endpoint/field tương ứng.

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/requests?status=` | Đơn đã gửi + trạng thái + `responseNote` |
| POST | `/api/student/requests` | Xem body dưới. → `201 { id }` |
| DELETE | `/api/student/requests/{id}` | Hủy đơn `Pending` của mình |
| GET | `/api/student/teachers/{teacherId}/availability?from=&to=` | Khung rảnh **chưa đặt** của GV đang dạy mình |
| GET | `/api/student/one-on-one` | Các buổi 1 kèm 1 của mình |

```json
{ "type": "Leave", "sessionId": 15, "reason": "Em bị ốm" }
{ "type": "Reschedule", "sessionId": 15, "reason": "...", "date": "2026-11-08", "startTime": "18:00:00", "endTime": "20:00:00" }
{ "type": "OneOnOneBooking", "availabilityId": 7, "reason": "Luyện Speaking Part 2" }
{ "type": "OneOnOneBooking", "teacherId": 1, "date": "2026-11-09", "startTime": "09:00:00", "endTime": "10:00:00" }
{ "type": "OneOnOneCancel", "oneOnOneSessionId": 3, "reason": "..." }
```
Lỗi: 403 buổi không thuộc lớp mình · 409 buổi đã diễn ra / khung giờ đã có người đặt / đã có đơn chờ cho buổi này.

## 4. Bài tập & nộp bài ⬜ (plan 12)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/assignments?classId=&state=todo\|submitted\|graded` | `title, skill, type, dueAt, isLate, myStatus, overallBand?` |
| GET | `/api/student/assignments/{id}` | Đề, `minWords`, `attachmentUrl`, `allowLate`, câu hỏi Quiz (**không có** `correctAnswer`), `attempts` (lịch sử nộp) |
| POST | `/api/student/assignments/{id}/submit` | `{ content?, audioUrl?, answers? }`. Gọi `SubmissionService.SubmitAsync`. 409 quá hạn và `allowLate=false` |
| POST | `/api/student/files?folder=submissions` | Upload audio Speaking → `{ url }` |
| GET | `/api/student/submissions/{id}` | Bài nộp của mình. Điểm (`tr/cc/lr/gra` hoặc `fc/lr/gra/p`, `overallBand`), `feedback`, `feedbackAudioUrl`, `annotations` **chỉ khi `Published`**. `Returned` thì có `returnNote` |

Quiz `answers`: `{ "12": "B", "13": "photosynthesis" }` (key = id câu hỏi).

## 5. Kết quả học tập ⬜ (plan 13)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/classes/{id}/grades` | Hàng của mình trong sổ điểm: cột bài tập + bài kiểm tra, điểm tổng kết, `Pass/Fail`, trọng số |
| GET | `/api/student/classes/{id}/attendance` | Từng buổi: `status`, `note`. Tổng: `attendanceRate`, `absenceRate` |
| GET | `/api/student/progress` | `bandHistory`, `targetBand`, `examHistory` |
| GET | `/api/student/reviews?classId=` | Nhận xét định kỳ GV viết |
| GET | `/api/student/final-report?classId=` | Phiếu cuối khóa (JSON). `/print` trả HTML để in |
| POST | `/api/student/teacher-ratings` | `{ classId, score: 1-5, comment }`. 409 nếu đã đánh giá lớp này |

## 5b. Phản hồi về giáo viên/lớp ✅ (trang Feedback)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/feedback/classes` ✅ | Các lớp đang học (Active) của học viên: `{ classId, className, courseId, courseName, description, bandFrom/To, totalSessions, sessionsPerWeek, tuition, teacherId, teacherName }` |
| GET | `/api/student/feedback?classId=` ✅ | Phản hồi của lớp (mới nhất trước): `[{ id, content, createdAt, studentName }]`. `403` nếu học viên không có ghi danh lớp này |
| POST | `/api/student/feedback` ✅ | Body `{ classId, content }`. Lưu vào bảng **StudentFeedbacks** (StudentId từ token, TeacherId từ lớp). `400` content rỗng/quá 1000 ký tự; `403` không đang học lớp này. Trả `201 { id, message }` |

> Bảng `StudentFeedbacks` tạo bằng script `docs/admin/sql/2026-11-04-student-feedback-table.sql` (DB local đang drift schema, chưa dùng được `dotnet ef migrations add` — nó sẽ kéo theo toàn bộ bảng TeacherFeatures của plan 00). Khi nhóm tạo migration `TeacherFeatures`, nhớ gộp bảng này vào cùng migration.

## 6. Học phí ✅ (plan 14) — trang Tuition

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/tuition` ✅ | Mỗi ghi danh: `enrollmentId, className, courseName, bandFrom, bandTo, totalSessions, tuitionFee, discountPercent, discountAmount, finalTuitionFee, paymentId, paidAmount, paidDate, method, note, isPaid` (mới nhất trước) |
| POST | `/api/student/tuition/pay` ✅ | Body `{ enrollmentIds: number[] }`. Tạo `Payment` (Amount = `finalTuitionFee`, Method `Cash` giả lập, PaidDate hôm nay) cho các ghi danh **chưa thanh toán** của mình; bỏ qua khoản đã đóng. `409` nếu không còn khoản nào hợp lệ. Trả `{ created, message }` |

## 7. Thông báo ⬜ (plan 14)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/notifications?unreadOnly=` | Thông báo của mình (`type, title, content, link, isRead, createdAt`) |
| GET | `/api/student/notifications/unread-count` | Số trên chuông |
| POST | `/api/student/notifications/{id}/read` · `/read-all` | Đánh dấu đã đọc |
| GET | `/api/student/announcements?classId=` | Thông báo GV gửi lớp mình |
