# 14 — BE Student: học phí + thông báo

- **Loại:** backlog
- **Vùng:** Student
- **Người làm:** Nam
- **Phụ thuộc:** 10 (học phí phối hợp với 20)
- **Độ khó:** Thấp

## Phạm vi (xem `docs/api/STUDENT_API.md` §6–7)
- `GET /api/student/tuition`: mỗi `Enrollment` của mình gồm khóa/lớp, `tuitionFee`, giảm giá, `finalTuitionFee`, đã đóng (`Payment`), còn nợ, trạng thái `Paid|Unpaid`. Chỉ đọc. Ghi nhận thanh toán là việc của Admin (plan 20).
- `GET /api/student/notifications?unreadOnly=`, `GET .../unread-count`, `POST .../{id}/read`, `POST .../read-all`. Lọc `RecipientUserId = UserId`. Mẫu: `TeacherPortal/NotificationsController.cs`.
- `GET /api/student/announcements?classId=`: thông báo GV gửi lớp mình.

## Tiêu chí hoàn thành
- [ ] Số tiền khớp với màn Admin
- [ ] Thông báo GV gửi (`POST /api/teacher/announcements`) hiện ở học viên đúng lớp
- [ ] `dotnet build` xanh
