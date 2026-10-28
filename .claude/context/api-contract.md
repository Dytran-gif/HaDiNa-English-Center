# Hợp đồng API (FE ↔ BE)

Nguồn sự thật: `docs/api/*.md`. FE chỉ code theo doc. BE đổi endpoint thì sửa doc trong cùng PR.

| Doc | Vùng | Trạng thái |
|---|---|---|
| `docs/api/README.md` | Quy ước chung + auth | Có |
| `docs/api/ADMIN_API.md` | `api/admin/*` | Có (sinh từ code hiện tại), còn thiếu Payments/Blog/Reports |
| `docs/api/TEACHER_API.md` | `api/teacher/*` | Đầy đủ |
| `docs/api/STUDENT_API.md` | `api/student/*` | **Spec để làm**, BE chưa có |
| `docs/api/PUBLIC_API.md` | `api/public/*` | **Spec để làm**, BE chưa có |

## Quy ước

- **Base URL**: FE đọc `import.meta.env.VITE_API_URL` (mặc định `http://localhost:5220`). File `app/frontend/.env.example`.
- **JSON**: `camelCase` cả request lẫn response.
- **Auth**: header `Authorization: Bearer <token>`.
- **Ngày giờ**: giờ địa phương, **không có `Z`**:
  - ngày `"2026-11-05"` (DateOnly) · giờ `"18:00:00"` (TimeOnly) · thời điểm `"2026-11-05T23:59:00"` (DateTime).
  - FE không dùng `new Date(str).toISOString()` để gửi lên (sẽ thành UTC). Dùng helper format cục bộ.
- **Phân trang** (Admin list): query `page`, `pageSize`. Response `PagedResult`:
  `{ items: [...], totalItems, page, pageSize, totalPages }`.
- **Lỗi**, hai dạng FE phải xử lý:
  1. Lỗi nghiệp vụ: `{ "message": "Tên phòng đã tồn tại" }`
  2. Lỗi validate DTO (400 tự động):
     `{ "title": "One or more validation errors occurred.", "status": 400, "errors": { "Name": ["Tên phòng là bắt buộc"] } }`
  - `apiClient` chuẩn hóa cả hai thành `ApiError { status, message, fieldErrors? }`.
- **Mã**: 200 OK · 201 Created (POST tạo mới) · 204 NoContent (DELETE) · 400 · 401 · 403 · 404 · 409 · 423.
- **File**: upload `multipart/form-data`, field `file`, trả `{ url }` dạng `/uploads/...` (ghép với base URL khi hiển thị).
- **Tải file** (Excel, phiếu in): fetch kèm token rồi `blob()`. Không mở link trần vì sẽ không có token.

## Khung `src/services/` (plan 01)

```
src/services/
├── apiClient.ts          # request<T>(method, path, body?) → T | ném ApiError; gắn token; xử lý 401
├── auth.ts               # login(), me()
├── admin/rooms.ts        # getRooms(), createRoom(), …  (1 file / tài nguyên)
├── teacher/classes.ts
├── student/…
└── public/courses.ts
```
Dùng `fetch` có sẵn của trình duyệt (không thêm thư viện). Service trả type FE (đã map), page chỉ `await` rồi render.
