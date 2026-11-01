# Hợp đồng API (FE ↔ BE)

Nguồn sự thật: `docs/api/*.md`. FE chỉ code theo doc. BE đổi endpoint thì sửa doc trong cùng PR.

| Doc | Vùng | Trạng thái |
|---|---|---|
| `docs/api/README.md` | Quy ước chung + auth | Có |
| `docs/api/ADMIN_API.md` | `api/admin/*` | Có (sinh từ code hiện tại), đã có Payments; còn thiếu Blog và các phần dashboard/báo cáo mở rộng |
| `docs/api/TEACHER_API.md` | `api/teacher/*` | Đầy đủ |
| `docs/api/STUDENT_API.md` | `api/student/*` | **Spec để làm**, BE chưa có |
| `docs/api/PUBLIC_API.md` | `api/public/*` | **Spec để làm**, BE chưa có |

## Quy ước

- **Base URL**: FE đọc import.meta.env.VITE_API_URL; mặc định chuỗi rỗng (cùng origin). Vite dev proxy /api và /uploads tới localhost:5220; production cần reverse proxy hoặc CORS nếu khác origin.
- **JSON**: `camelCase` cả request lẫn response.
- **Auth**: header `Authorization: Bearer <token>`.
- **Ngày giờ**: giờ địa phương, **không có `Z`**:
  - ngày `"2026-11-05"` (DateOnly) · giờ `"18:00:00"` (TimeOnly) · thời điểm `"2026-11-05T23:59:00"` (DateTime).
  - FE không dùng `new Date(str).toISOString()` để gửi lên (sẽ thành UTC). Dùng helper format cục bộ.
- **Phân trang** (Admin list): query `page`, `pageSize`. Response `PagedResult`:
  `{ items: [...], total, totalItems, page, pageSize, totalPages }` (total là alias bổ sung, giữ field cũ).
- **Lỗi**, hai dạng FE phải xử lý:
  1. Lỗi nghiệp vụ: `{ "message": "Tên phòng đã tồn tại" }`
  2. Lỗi validate DTO (400 tự động):
     `{ "title": "One or more validation errors occurred.", "status": 400, "errors": { "Name": ["Tên phòng là bắt buộc"] } }`
  - `apiClient` chuẩn hóa cả hai thành `ApiError { status, message, fieldErrors? }`.
- **Mã**: 200 OK · 201 Created (POST tạo mới) · 204 NoContent (DELETE) · 400 · 401 · 403 · 404 · 409 · 423.
- **File**: upload `multipart/form-data`, field `file`, trả `{ url }` dạng `/uploads/...` (ghép với base URL khi hiển thị).
- **Tải file** (Excel, phiếu in): fetch kèm token rồi `blob()`. Không mở link trần vì sẽ không có token.

## Lớp gọi API hiện có (2026-10-30)

```
src/services/
├── apiClient.ts          # request<T>(path, token?, init?) → T | ném ApiError; gắn token; xử lý 401
├── auth.ts               # login(), me()
├── admin/rooms.ts        # getRooms(), createRoom(), …  (1 file / tài nguyên)
├── teacher/classes.ts
├── student/…
└── public/courses.ts
```
Dùng `fetch` có sẵn của trình duyệt (không thêm thư viện). Service trả type FE (đã map), page chỉ `await` rồi render.

Admin thực tế dùng services/admin/useAdminApi.ts cho get/send và useAdminQuery (abort/loading/error; tùy chọn tải hết trang danh mục). Type camelCase tại types/adminApi.ts. ApiError có status/message/fieldErrors, nhận cả message/errors và ProblemDetails. Khung auth.ts/rooms.ts trong sơ đồ là gợi ý mở rộng, không phải file đã tồn tại. UI Admin dùng Components/Ui, xem DESIGN-SYSTEM và tracker; không đổi hợp đồng BE trong đợt UI.
