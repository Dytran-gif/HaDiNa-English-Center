# src/services/: lớp gọi API (CHƯA CÓ CODE, plan 01)

Thư mục giữ chỗ. Khi làm plan `01` thì xóa file này hoặc thay bằng hướng dẫn thật.

```
services/
├── apiClient.ts      # (DÙNG CHUNG) fetch + token + chuẩn hóa lỗi ApiError + xử lý 401
├── auth.ts           # login(), me()            (plan 03)
├── public/           # courses.ts, teachers.ts…  (plan 41)
├── admin/            # rooms.ts, courses.ts…     (plan 23, rooms.ts làm mẫu ở plan 01)
├── teacher/          # dashboard.ts, classes.ts… (plan 30)
└── student/          # dashboard.ts, schedule.ts…(plan 15)
```

Luật:
- 1 file / tài nguyên. Hàm đặt tên động từ + danh từ: `getRooms`, `createRoom`, `submitAssignment`.
- Service trả **type FE** (`src/types/`). Map camelCase của API sang field FE **ở đây**, không làm trong page.
- Page chỉ `await service()` và xử lý loading / lỗi / rỗng.
- Không thêm thư viện (axios…). Chỉ dùng `fetch`.

Hợp đồng: `docs/api/`. Chi tiết: `.claude/context/api-contract.md`.
