# Mô hình dữ liệu (EF Core → SQL Server `EnglishCenterDb`)

ERD gốc của đồ án: `docs/do-an/ERD-website-trung-tam-tieng-anh.mmd`. Code là nguồn sự thật, ERD nào lệch thì cập nhật ERD.

## Nhóm bảng

| Nhóm | Entity (file trong `Entities/`) | Ai ghi | Ai đọc |
|---|---|---|---|
| Tài khoản | `User`, `Teacher`, `Student` | Admin | tất cả |
| Đào tạo | `Course`, `CourseClass` (bảng `Classes`), `ClassSchedule`, `Room` | Admin | Teacher, Student, Public |
| Ghi danh & học phí | `Enrollment`, `Payment` | Admin | Student (học phí của mình) |
| Nội dung trang | `Post`, `HomepageImage`, `CenterSetting` | Admin | Public |
| Buổi học | `ClassSession`, `SyllabusLesson`, `SessionMaterial` | Teacher (sinh tự động bởi `SessionService.SyncAsync`) | Student |
| Điểm danh | `Attendance` | Teacher | Student |
| Bài tập | `Assignment`, `AssignmentStudent`, `AssignmentQuestion` | Teacher | Student |
| Bài nộp | `Submission`, `SubmissionAnnotation`, `CommentTemplate` | **Student nộp** (`SubmissionService.SubmitAsync`), Teacher chấm | cả hai |
| Kiểm tra & điểm | `Exam`, `ExamResult`, `GradeConfig` | Teacher | Student |
| Đánh giá | `StudentReview`, `PromotionRecommendation` | Teacher | Student, Admin |
| | `TeacherRating` | **Student** | Teacher, Admin |
| Đơn từ | `TeacherRequest` (GV → Admin) | Teacher | Admin |
| | `StudentRequest` (HV → GV) | **Student** | Teacher |
| Lịch 1 kèm 1 | `TeacherAvailability`, `OneOnOneSession` | Teacher khai báo, Student đặt | cả hai |
| Thông báo | `Notification`, `Announcement` | hệ thống (`NotificationService`), Teacher | người nhận |

DbSet: nhóm Tài khoản/Đào tạo/Ghi danh/Nội dung nằm trong `Data/AppDbContext.cs`, phần còn lại trong `Data/AppDbContext.Teacher.cs`.
Bảng mới của Student thì đặt trong `Data/AppDbContext.Student.cs`.

## Quan hệ chính

```
User 1─1 Teacher 1─* CourseClass *─1 Course 1─* SyllabusLesson
User 1─1 Student 1─* Enrollment *─1 CourseClass 1─* ClassSchedule *─1 Room
                     Enrollment 1─0..1 Payment
CourseClass 1─* ClassSession 1─* Attendance *─1 Student
                ClassSession 1─* SessionMaterial
CourseClass 1─* Assignment 1─* Submission *─1 Student
CourseClass 1─* Exam 1─* ExamResult *─1 Student
```

## Giá trị trạng thái (chuỗi)

| Field | Giá trị |
|---|---|
| `User.Role` | `admin` · `teacher` · `student` (chữ thường) |
| `Student.Status` | `Studying` · `OnHold` · `Dropped` |
| `Teacher.Status` | `Teaching` · `OnLeave` |
| `Enrollment.Status` | `Active` · `OnHold` · `Dropped` |
| `ClassSession.Status` (lưu) | `Scheduled` · `Cancelled`. Hiển thị `Upcoming/Ongoing/Done` là **tính ra** |
| `ClassSession.Type` | `Regular` · `Makeup` |
| `Attendance.Status` | `Present` · `Late` · `Absent` · `Excused` |
| `Assignment.Type` / `Skill` | `Writing·Speaking·Quiz` / `Writing·Speaking·Reading·Listening` |
| `Submission.Status` | `Submitted` · `Draft` · `Published` · `Returned` |
| `Exam.Type` | `Periodic` · `Midterm` · `Final` |
| `*Request.Status` | `Pending` · `Approved` · `Rejected` · `Cancelled` |
| `StudentRequest.Type` | `Leave` · `Reschedule` · `OneOnOneBooking` · `OneOnOneCancel` |
| `TeacherRequest.Type` | `Leave` · `Reschedule` · `AttendanceUnlock` |
| `Payment.Method` | `Cash` · `Transfer` |
| `Post.Status` | `Draft` · `Published` |

## Luật dữ liệu dùng chung (Student ↔ Teacher), trích `docs/api/TEACHER_API.md`

- Học viên chỉ thấy điểm bài nộp khi `Submission.Status = Published`.
- Nộp bài **bắt buộc** gọi `SubmissionService.SubmitAsync(studentId, assignmentId, content, audioUrl, answers)`, không tự insert `Submission`.
- Link "Tham gia ngay" = `ClassSession.MeetingUrl ?? CourseClass.MeetingUrl` (`SessionService.EffectiveMeetingUrl`).
- % hoàn thành khóa = số buổi `IsTaught` / số bài syllabus.
- Thông báo cho học viên: `Notification.RecipientUserId` = `Student.UserId` (không phải `Student.Id`).
- Đặt 1 kèm 1: chỉ được chọn `TeacherAvailability` có `IsBooked = false`.
