# 10 — BE Student: nền portal + dashboard + hồ sơ

- **Loại:** backlog
- **Vùng:** Student
- **Người làm:** Nam
- **Phụ thuộc:** 00
- **Độ khó:** Vừa

## Mục tiêu
Dựng `Controllers/StudentPortal/` theo đúng khuôn của `TeacherPortal`: lớp base lọc theo học viên đang đăng nhập, cộng 2 nhóm endpoint đầu tiên (dashboard, hồ sơ) để FE Student nối được.

## Phạm vi
- `Controllers/StudentPortal/StudentControllerBase.cs`, chép cấu trúc `TeacherControllerBase.cs`:
  - `[Authorize(Roles = "student")]`, `IAsyncActionFilter` tra `Students` theo `UserId`, gán `StudentId`, `StudentName`, `UserId`
  - helper: `MyEnrollments` (Status = Active), `MyClassIds()`, `IsEnrolledAsync(classId)`, `MySessionAsync(sessionId)` (buổi thuộc lớp mình học), `Error(status, message)`
- `DashboardController`: `GET /api/student/dashboard` (xem `docs/api/STUDENT_API.md` §1)
- `ProfileController`: `GET /api/student/profile`, `PUT /api/student/profile` (SĐT, địa chỉ, phụ huynh), `POST /api/student/profile/avatar`, `POST /api/student/profile/change-password`, `POST /api/student/profile/logout`. Mẫu ở `TeacherPortal/ProfileController.cs`.
- `GET /api/student/classes` + `GET /api/student/classes/{id}` (khóa, GV, lịch tuần, tiến độ %, link học)
- `Dtos/StudentPortal/` cho request
- `Student.http` chứa request mẫu
- Ngoài phạm vi: lịch, bài tập, điểm, học phí (plan 11–14)

## Đọc trước khi làm
- `.claude/context/backend.md`, `data-model.md`, `datetime.md`
- `Controllers/TeacherPortal/TeacherControllerBase.cs`, `TeacherPortal/DashboardController.cs`, `TeacherPortal/ProfileController.cs`
- `Services/SessionService.cs` (`SyncAsync`, `StatusOf`, `EffectiveMeetingUrl`)
- `docs/api/STUDENT_API.md`

## Tiêu chí hoàn thành
- [ ] Token teacher/admin gọi `api/student/*` thì 403. Token student không có hồ sơ thì 403.
- [ ] Học viên A không xem được lớp của học viên B (gọi `/classes/{id}` lớp không ghi danh thì 404)
- [ ] `docs/api/STUDENT_API.md` §1 và §2 khớp code
- [ ] `dotnet build` xanh
