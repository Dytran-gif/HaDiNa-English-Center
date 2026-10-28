# API chức năng Student (SPEC, CHƯA CODE)

> **Trạng thái: đề xuất.** Đây là hợp đồng để nhóm Student code BE (plan 10–14) và FE (plan 15) song song.
> Đổi gì thì sửa ở đây trước. Mục nào đã code xong thì đổi nhãn `⬜` thành `✅`.

Tất cả cần token của tài khoản **student**. Học viên chỉ thấy **dữ liệu của mình** và của **lớp mình đang học** (`Enrollment.Status = Active`). Quy ước chung xem [README.md](./README.md).

Dữ liệu dùng chung với Teacher (bảng nào bên nào ghi): xem mục cuối [TEACHER_API.md](./TEACHER_API.md) và `.claude/context/data-model.md`.

## 1. Dashboard ⬜ (plan 10)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/dashboard` | `stats` (số lớp đang học, bài chưa nộp, tỉ lệ chuyên cần, band gần nhất), `todaySessions` (buổi hôm nay + `meetingUrl` + `status`), `nextSession`, `dueAssignments` (5 bài sắp đến hạn), `recentResults` (bài vừa công bố điểm), `unreadNotifications` |

## 2. Hồ sơ & lớp của tôi ⬜ (plan 10)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/profile` | `{ code, fullName, email, phone, dateOfBirth, address, parentName, parentPhone, targetBand, avatarUrl }` |
| PUT | `/api/student/profile` | `{ phone, address, parentName, parentPhone }` (họ tên, email, mã do Admin quản lý) |
| POST | `/api/student/profile/avatar` | multipart `file` (jpg/png/webp ≤ 5 MB) |
| POST | `/api/student/profile/change-password` | `{ currentPassword, newPassword, confirmPassword }`. Trả `token` mới |
| POST | `/api/student/profile/logout` | Tăng `TokenVersion` |
| GET | `/api/student/classes?status=Ongoing\|Upcoming\|Finished` | Lớp đã/đang học: khóa, GV, lịch tuần, `progressPercent`, `attendanceRate` |
| GET | `/api/student/classes/{id}` | Chi tiết: syllabus (bài nào đã dạy), danh sách buổi, tài liệu từng buổi, `meetingUrl`. 404 nếu không học lớp này |

## 3. Lịch học & yêu cầu ⬜ (plan 11)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/schedule?view=week\|month&date=2026-11-04` | `events` (`kind`: Class / Makeup / OneOnOne, giờ, lớp, phòng, GV, `status`, `meetingUrl`), `days`, `previous`/`next` (giống Teacher) |
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

## 6. Học phí ⬜ (plan 14)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/tuition` | Mỗi ghi danh: `className, courseName, tuitionFee, discountPercent, discountAmount, finalTuitionFee, paidAmount, paidDate, method, isPaid` |

## 7. Thông báo ⬜ (plan 14)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/student/notifications?unreadOnly=` | Thông báo của mình (`type, title, content, link, isRead, createdAt`) |
| GET | `/api/student/notifications/unread-count` | Số trên chuông |
| POST | `/api/student/notifications/{id}/read` · `/read-all` | Đánh dấu đã đọc |
| GET | `/api/student/announcements?classId=` | Thông báo GV gửi lớp mình |
