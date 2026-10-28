# 15 — FE Student: trang còn thiếu + nối API

- **Loại:** backlog (nên tách thành nhiều plan nhỏ theo từng trang khi `/plan`)
- **Vùng:** Student
- **Người làm:** Nam
- **Phụ thuộc:** 01, 03, 10–14 (có thể làm UI trước bằng mock, nối API sau)
- **Độ khó:** Cao

## Hiện trạng
- Có: `Dashboard`, `Course` (đang lỗi typecheck, plan 02), `Layout`, `Header`, `Sidebar`.
- Sidebar đã có menu `Schedule`, `Feedback`, `Tuition` nhưng route đang **comment** trong `src/routes.tsx` và chưa có page.

## Phạm vi
1. Tạo page: `src/pages/student/Schedule/`, `Feedback/` (kết quả + nhận xét + đánh giá GV), `Tuition/`. Có thể thêm `Assignments/` (bài tập & nộp bài, menu mới).
2. Bỏ comment route trong `src/routes.tsx` (file dùng chung, báo nhóm).
3. Nối API: `src/services/student/*.ts` theo `docs/api/STUDENT_API.md`, thay mock `src/data/StudentData/`.
4. Header: chuông thông báo dùng `unread-count`.

## Đọc trước khi làm
- `.claude/context/frontend.md`, `api-contract.md`
- `src/pages/teacher/Schedule/Schedule.tsx` (mẫu lịch tuần), `src/pages/teacher/Assignments/`
- `docs/api/STUDENT_API.md`

## Tiêu chí hoàn thành
- [ ] 5 mục menu Student đều mở được trang
- [ ] Mỗi trang có loading / lỗi / rỗng
- [ ] Không còn import `src/data/StudentData/*` ở trang đã nối API
- [ ] lint + typecheck xanh
