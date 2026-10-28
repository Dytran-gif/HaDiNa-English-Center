# 11 — BE Student: lịch học, đơn xin nghỉ / đổi buổi, đặt lịch 1 kèm 1

- **Loại:** backlog
- **Vùng:** Student
- **Người làm:** Nam
- **Phụ thuộc:** 10
- **Độ khó:** Cao (dính luật của Teacher)

## Mục tiêu
Học viên xem lịch tuần/tháng của mình và gửi yêu cầu cho giáo viên. Giáo viên đã có màn duyệt (`api/teacher/requests`).

## Phạm vi (xem `docs/api/STUDENT_API.md` §3)
- `GET /api/student/schedule?view=week|month&date=`: buổi lớp + buổi bù + 1 kèm 1, kèm `status` tính bằng `SessionService.StatusOf`, `meetingUrl` (dùng `EffectiveMeetingUrl`), `previous/next`. Mẫu: `TeacherPortal/ScheduleController.cs`.
- `GET/POST /api/student/requests`, `DELETE /api/student/requests/{id}` (chỉ hủy được đơn `Pending`). Ghi vào `StudentRequests` với `TeacherId` = GV của lớp.
  - `Leave` / `Reschedule`: bắt buộc `sessionId` thuộc lớp mình, buổi chưa diễn ra.
  - `OneOnOneBooking`: `availabilityId` (khung `IsBooked = false`) **hoặc** `date+startTime+endTime`.
  - `OneOnOneCancel`: `oneOnOneSessionId` của mình.
- `GET /api/student/teachers/{teacherId}/availability?from=&to=`: chỉ GV đang dạy mình, chỉ khung chưa đặt.
- Gửi thông báo cho GV bằng `NotificationService.Add(teacher.UserId, ...)`.

## Đọc trước khi làm
- `Entities/Requests.cs` (`StudentRequest`, `TeacherAvailability`, `OneOnOneSession`)
- `Controllers/TeacherPortal/RequestsController.cs` (logic approve: biết BE Teacher chờ dữ liệu dạng nào)
- `docs/api/TEACHER_API.md` mục "Phần dành cho nhóm Student"
- `.claude/context/datetime.md`

## Tiêu chí hoàn thành
- [ ] Đơn học viên gửi xuất hiện ở `GET /api/teacher/requests` của đúng GV
- [ ] GV duyệt `Leave` thì điểm danh buổi đó tự `Excused` (đã có ở Teacher, chỉ cần test end-to-end)
- [ ] Không đặt được khung `IsBooked = true`, không gửi đơn cho buổi của lớp khác (403/409)
- [ ] `dotnet build` xanh
