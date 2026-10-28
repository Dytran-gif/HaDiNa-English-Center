# Hợp đồng API: quy ước chung

Thư mục này là **nguồn sự thật** cho giao tiếp FE ↔ BE.
- BE thêm hoặc đổi endpoint thì sửa doc ở đây **trong cùng PR**.
- FE chỉ code theo doc ở đây, không đoán từ code BE.

| File | Prefix | Trạng thái |
|---|---|---|
| [ADMIN_API.md](./ADMIN_API.md) | `api/admin` | Đã code một phần (thiếu học phí, blog, báo cáo) |
| [TEACHER_API.md](./TEACHER_API.md) | `api/teacher` | Đã code đầy đủ |
| [STUDENT_API.md](./STUDENT_API.md) | `api/student` | **Spec, chưa code** |
| [PUBLIC_API.md](./PUBLIC_API.md) | `api/public` | **Spec, chưa code** |

## Môi trường

| | Giá trị |
|---|---|
| Base URL (dev) | `http://localhost:5220` (profile `http`) / `https://localhost:7238` (profile `https`) |
| FE đọc từ | `import.meta.env.VITE_API_URL` |
| OpenAPI (dev) | `GET /openapi/v1.json` |
| File upload | phục vụ tĩnh tại `/uploads/...` |

## Đăng nhập (`api/auth`)

| Method | URL | Body | Response |
|---|---|---|---|
| POST | `/api/auth/login` | `{ "email", "password" }` | `200 { token, userId, email, role }` · `401` sai thông tin · `403` tài khoản khóa |
| GET | `/api/auth/me` | — | `{ email, role }` |

Tài khoản demo (mật khẩu `123456`): `admin@demo.com` · `teacher@demo.com` · `student@demo.com`.
Mọi endpoint khác (trừ `api/public`) cần header `Authorization: Bearer <token>`.

## Định dạng

- JSON `camelCase`.
- Ngày giờ **giờ địa phương, không `Z`**: ngày `"2026-11-05"`, giờ `"18:00:00"`, thời điểm `"2026-11-05T23:59:00"`.
- Thứ trong tuần: `1` = Thứ Hai … `7` = Chủ nhật.
- Tiền: số (VND), không định dạng sẵn.
- Phân trang: query `page` (từ 1), `pageSize`. Response:
  ```json
  { "items": [], "totalItems": 42, "page": 1, "pageSize": 10, "totalPages": 5 }
  ```

## Lỗi

| Mã | Ý nghĩa | Body |
|---|---|---|
| 400 | Sai dữ liệu nghiệp vụ | `{ "message": "..." }` |
| 400 | Sai validate DTO (tự động) | `{ "title": "...", "status": 400, "errors": { "Field": ["..."] } }` |
| 401 | Chưa đăng nhập / token hết hạn / bị thu hồi | (rỗng) |
| 403 | Sai vai trò / không có quyền | `{ "message": "..." }` hoặc rỗng |
| 404 | Không tìm thấy (hoặc không thuộc quyền) | `{ "message": "..." }` |
| 409 | Xung đột nghiệp vụ | `{ "message": "..." }` |
| 423 | Đã khóa | `{ "message": "..." }` |

## Cách viết một mục endpoint (cho doc mới)

```markdown
| Method | URL | Mô tả |
|---|---|---|
| POST | `/api/student/requests` | Gửi đơn: `{ "type": "Leave", "sessionId": 12, "reason": "..." }` → `201 { id }`. 409 nếu buổi đã qua |
```
Ghi đủ: query param, body (JSON mẫu), response chính, các mã lỗi nghiệp vụ.
