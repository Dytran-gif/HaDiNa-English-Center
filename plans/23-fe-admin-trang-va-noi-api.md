# 23 — FE Admin: trang còn thiếu + nối API

- **Loại:** backlog (tách nhỏ theo trang khi `/plan`)
- **Vùng:** Admin
- **Người làm:** Duy (Dytran-gif)
- **Phụ thuộc:** 01, 03 · (Payments chờ 20, Blog chờ 21, Dashboard/Reports chờ 22)
- **Độ khó:** Cao

## Lệch giữa FE và BE hiện tại

| BE đã có | FE hiện có | Việc |
|---|---|---|
| `api/admin/courses` | `Courses/CoursesManagement` | nối API |
| `api/admin/students`, `api/admin/teachers` | `Users/UsersManagement` | nối API (tách 2 tab Học viên / Giáo viên, khóa/mở, reset mật khẩu) |
| `api/admin/rooms` | `Rooms/RoomsManagement` | nối API (**làm đầu tiên**, có service mẫu từ plan 01) |
| `api/admin/classes` (+ lịch tuần, thêm/bớt học viên) | **chưa có** | **tạo trang** `Classes/` |
| `api/admin/teacher-requests` | **chưa có** | **tạo trang** `TeacherRequests/` (duyệt nghỉ/đổi buổi/mở điểm danh) |
| `api/admin/settings` | **chưa có** | **tạo trang** `Settings/` (thông tin trung tâm, đổi mật khẩu) |
| chưa có (plan 20) | `Payments/` | chờ BE |
| chưa có (plan 21) | `Blog/` | chờ BE |
| chưa có (plan 22) | `Dashboard/`, `Reports/` | chờ BE |

## Phạm vi
- `src/services/admin/*.ts` (1 file / tài nguyên), map sang type FE.
- Thay `useLocalCollection` bằng service ở trang đã có BE.
- Thêm route + menu cho 3 trang mới (`routes.tsx` là file dùng chung; `AdminData/sidebarMenuItems.ts`, `pageTitles.ts`).

## Tiêu chí hoàn thành
- [ ] Mọi trang có BE đều dùng dữ liệu thật, reload không mất
- [ ] Lỗi 409 (trùng tên, trùng lịch phòng…) hiện đúng message BE
- [ ] lint + typecheck xanh
