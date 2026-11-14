# API chức năng Teacher (bản tối giản, 14/11/2026)

Dùng **14 bảng chung** của nhóm + bảng `Attendances` (điểm danh) = 15 bảng (xem `docs/DATABASE.md`).
Mọi API cần header `Authorization: Bearer <token>` của tài khoản **teacher** (`teacher@demo.com` / `123456`).
Giáo viên chỉ thấy và thao tác trên **lớp mình phụ trách**. Lỗi trả `{ "message": "..." }` (400, 403, 404, 409).
Ngày giờ là giờ Việt Nam, không có `Z`: `"2026-11-05T23:59:00"`, ngày `"2026-11-05"`, giờ `"18:00:00"`.

Code: `app/backend/.../Controllers/TeacherPortal/`. FE: `app/frontend/src/pages/teacher/`, gọi qua `services/teacher/teacherApi.ts`.

## Hồ sơ — `ProfileController`

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/teacher/profile` | `{ id, fullName, email, phone, specialty, degree, hireDate, status, avatarUrl, classCount }` |
| POST | `/api/teacher/profile/avatar` | multipart `file` (jpg/png/webp ≤ 5 MB) → `{ avatarUrl }` |
| POST | `/api/teacher/profile/change-password` | `{ currentPassword, newPassword }` (≥ 8 ký tự) → `{ message, token }` (token mới) |
| POST | `/api/teacher/profile/logout` | Tăng `TokenVersion`, mọi token cũ hết hiệu lực |

## Tổng quan, lớp, lịch dạy — `TeacherClassesController`

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/teacher/dashboard` | `{ classCount, ongoingClassCount, studentCount, assignmentCount, newSubmissionCount (7 ngày), today: ScheduleEvent[], unmarkedSessions: ScheduleEvent[] (7 ngày chưa điểm danh), recentSubmissions: [...8] }` |
| GET | `/api/teacher/classes?status=Ongoing\|Upcoming\|Finished` | Lớp phụ trách: `{ id, name, courseId, courseName, startDate, endDate, maxStudents, meetingUrl, enrolledCount, status, schedules: [{ dayOfWeek, startTime, endTime, roomName }] }` |
| GET | `/api/teacher/classes/{id}` | Như trên + `totalSessions`, `students: [{ id, code, fullName, phone, email, enrollmentStatus, enrolledAt }]` |
| GET | `/api/teacher/schedule?from=yyyy-MM-dd&to=yyyy-MM-dd` | Buổi dạy trong khoảng (mặc định tuần này, tối đa 62 ngày), sinh từ `ClassSchedules` trong thời gian lớp: `ScheduleEvent = { date, classId, className, courseName, startTime, endTime, roomName, meetingUrl, attendanceMarked }` |

`dayOfWeek`: 1 = Thứ Hai … 7 = Chủ nhật. Không lưu buổi học riêng (không có buổi bù / hủy buổi).

## Điểm danh — `TeacherAttendanceController` (bảng `Attendances`)

1 dòng = 1 học viên ở 1 lớp trong 1 **ngày học** (unique `ClassId + StudentId + Date`). Ngày học = ngày có lịch tuần của lớp trong
`StartDate–EndDate`. Lớp có 2 ca trong 1 ngày vẫn điểm danh 1 lần. Chỉ điểm danh hôm nay hoặc ngày đã qua, sửa lại lúc nào cũng được.
Trạng thái: `Present` (có mặt) · `Late` (muộn) · `Absent` (vắng) · `Excused` (có phép).

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/teacher/attendance/sessions?classId=&from=&to=` | Ngày học tới hôm nay (mới nhất trước, tối đa 120 ngày): `{ date, startTime, endTime, roomName, isToday, studentCount, markedCount, absentCount, lateCount }` |
| GET | `/api/teacher/attendance?classId=&date=` | Bảng điểm danh 1 ngày: `{ classId, className, date, startTime, endTime, roomName, canEdit, items: [{ studentId, code, fullName, enrollmentStatus, status \| null, note }] }` |
| PUT | `/api/teacher/attendance` | `{ classId, date, items: [{ studentId, status, note? }] }` — thêm hoặc sửa (note ≤ 300 ký tự) |
| GET | `/api/teacher/attendance/summary?classId=` | `{ heldDays, markedDays, items: [{ studentId, code, fullName, enrollmentStatus, present, late, absent, excused, total, attendanceRate }] }`; `attendanceRate` = (có mặt + muộn) / số buổi đã điểm danh × 100 |

`GET /api/teacher/students/{id}` có thêm `attendance` (đếm theo lớp) và `recentAbsences` (10 lần vắng/muộn/phép gần nhất).

## Học viên + nhận xét — `TeacherStudentsController`

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/teacher/students?classId=&q=` | Học viên trong lớp mình dạy (tìm theo tên, mã, email, SĐT): `{ id, code, fullName, phone, email, status, classes: [{ id, name, enrollmentStatus }] }` |
| GET | `/api/teacher/students/{id}` | `{ student, classes, submissions, feedbacks }` (chỉ dữ liệu liên quan tới mình) |
| GET | `/api/teacher/feedbacks?classId=&studentId=` | Nhận xét mình đã viết: `{ id, studentId, studentCode, studentName, classId, className, content, createdAt }` |
| POST | `/api/teacher/feedbacks` | `{ studentId, classId, content }` (≤ 1000 ký tự). Học viên xem ở `GET /api/student/feedback/...` |
| DELETE | `/api/teacher/feedbacks/{id}` | Xóa nhận xét của chính mình |

## Bài tập dạng file — `TeacherAssignmentsController`

Dùng chung bảng `Assignments` với module Student: GV giao → `FileType = 'Teacher'`, `CourseId` = khóa, `StudentId` NULL;
HV nộp → `FileType = 'Student'`, `AssignmentId` = bài gốc. File ở `wwwroot/uploads/AssignmentUploads`, chỉ PDF/DOC/DOCX ≤ 15 MB,
**tự dọn sau 7 ngày** (`AssignmentFileCleanupService`, record vẫn giữ, `hasFile = false`).

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/teacher/assignments/courses` | Khóa có lớp mình dạy `{ id, name }` |
| GET | `/api/teacher/assignments?courseId=` | Bài mình giao: `{ id, title, description, fileName, hasFile, courseId, courseName, createdAt, submittedCount, studentCount }` |
| POST | `/api/teacher/assignments` | multipart: `courseId`, `title` (≤ 250), `description?` (≤ 2000), `file?`. Cần có file hoặc mô tả |
| DELETE | `/api/teacher/assignments/{id}` | Chỉ khi chưa có học viên nộp (409 nếu đã có) |
| GET | `/api/teacher/assignments/{id}/download` | Tải file đề |
| GET | `/api/teacher/assignments/{id}/submissions` | `{ assignment, items: [{ studentId, code, fullName, className, attemptCount, submission: { id, fileName, hasFile, submittedAt } \| null }] }` (bài nộp mới nhất của mỗi học viên) |
| GET | `/api/teacher/submissions/{id}/download` | Tải file bài nộp |

## Đã bỏ so với bản cũ

Bảng buổi học riêng (buổi bù / hủy), khóa điểm danh 48 giờ, giáo án, tài liệu theo buổi, bài Writing/Speaking/Quiz trên web, chấm IELTS, bài kiểm tra, sổ điểm,
nhận xét định kỳ nhiều tiêu chí, yêu cầu học viên, lịch rảnh / 1 kèm 1, thông báo (chuông). Các bảng tương ứng không còn.
