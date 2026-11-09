# 30 — FE Teacher: trang còn thiếu + nối API

- **Loại:** backlog (tách nhỏ theo trang khi `/plan`)
- **Vùng:** Teacher
- **Người làm:** Duy (Dytran-gif)
- **Phụ thuộc:** 00, 01, 03
- **Độ khó:** Cao

## Lệch giữa FE và BE (`docs/api/TEACHER_API.md`)

| Mục API | FE hiện có | Việc |
|---|---|---|
| §1 Dashboard | `Dashboard/` | nối API |
| §2 Lịch dạy, đơn nghỉ/đổi buổi, lịch rảnh | `Schedule/` | nối API, thêm form đơn + khai báo lịch rảnh |
| §3 Lớp, buổi học, syllabus, tài liệu | `Classes/`, `Materials/` | nối API. Tài liệu gắn theo **buổi** (`sessions/{id}/materials`), nên `Materials/` chuyển thành bước con của chi tiết buổi |
| §4 Điểm danh | `Attendance/` | nối API (khóa 48h, nút "Tất cả có mặt", cảnh báo >20%) |
| §5 Bài tập | `Assignments/` | nối API (Writing/Speaking/Quiz) |
| §6 Chấm bài | **chưa có** | **tạo trang** `Grading/` (danh sách + màn chấm band + annotation) |
| §7 Kiểm tra & sổ điểm | `Grades/` | nối API (sổ điểm, trọng số, xuất Excel) |
| §8 Học viên | **chưa có** | **tạo trang** `Students/` (hồ sơ tiến bộ, nhận xét định kỳ, phiếu cuối khóa) |
| §9 Yêu cầu & thông báo | **chưa có** | **tạo trang** `Requests/` + chuông thông báo ở Header |
| §10 Hồ sơ | `Profile/` | nối API (avatar, bảng công, đánh giá) |

## Phạm vi
- `src/services/teacher/*.ts` khớp từng mục API.
- Thứ tự gợi ý: Dashboard → Classes/Sessions → Attendance → Assignments → Grading → Grades → Students → Requests → Schedule → Profile.

## Tiêu chí hoàn thành
- [x] Mọi mục §1–§10 có giao diện dùng API thật
- [x] `src/data/TeacherData/` không còn được import ở trang đã nối (chỉ còn `sidebarMenuItems`, `pageTitles` là cấu hình)
- [x] lint + typecheck xanh

## Kết quả (2026-11-02)
- Service: `src/services/teacher/teacherApi.ts` (`useTeacherApi`, `useTeacherQuery`, upload / tải Excel / in phiếu). Kiểu dữ liệu: `src/types/teacherApi.ts`.
- Trang mới: `Classes/ClassDetail`, `Sessions/SessionDetail`, `Grading/Grading` + `GradingDetail`, `Students/Students` + `StudentDetail`, `Requests/Requests`. Trang cũ viết lại theo API: Dashboard, Classes, Attendance, Assignments (+ `AssignmentForm`), Grades, Schedule (+ `LeaveRequestModal`), Materials, Profile. Header có chuông thông báo.
- Route thêm trong `routes.tsx` (chỉ khối `/teacher`): `classes/:id`, `sessions/:id`, `grading`, `grading/:id`, `students`, `students/:id`, `requests`.
- Đã chạy thử toàn bộ 18 màn bằng trình duyệt headless với server giả đúng shape controller: không lỗi runtime. **Chưa** chạy với BE + SQL Server thật.
- Còn lại: Admin chưa có API duyệt đơn nghỉ / đổi buổi / mở lại điểm danh của giáo viên (`Admin/TeacherRequestsController` đã bị gỡ ở commit c145cd9) — nhóm cần chốt.
