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
- [ ] Mọi mục §1–§10 có giao diện dùng API thật
- [ ] `src/data/TeacherData/` không còn được import ở trang đã nối
- [ ] lint + typecheck xanh
