# 03 — Đăng nhập thật qua `POST /api/auth/login`

- **Loại:** backlog
- **Vùng:** Chung (nền auth)
- **Người làm:** Hoàng
- **Phụ thuộc:** 01
- **Độ khó:** Vừa

## Mục tiêu
`AuthContext` thôi tra mock `src/data/users.ts`, chuyển sang gọi API và giữ token cho `apiClient`. Các page đang dùng `useAuth()` **không phải sửa** (trừ `Login.tsx`).

## Phạm vi
- `login(email, password)` thành `async`, trả `User | null` hoặc ném `ApiError` để Login hiện message.
- Lưu `{ token, role, email, userId, fullName }`. `fullName` lấy từ endpoint hồ sơ theo vai trò (teacher: `GET /api/teacher/profile`; student: `GET /api/student/profile` khi plan 10 xong; admin: dùng email).
- `logout()`: xóa storage. Với teacher thì gọi thêm `POST /api/teacher/profile/logout` (tăng TokenVersion).
- 401 từ `apiClient` thì tự logout và chuyển về `/dang-nhap`.
- Giữ type `User` hiện có (`full_name`, `role`…), chỉ map trong `src/services/auth.ts`.
- Ngoài phạm vi: đăng ký tài khoản (`/dang-ky`). BE chưa có endpoint, giữ mock và ghi chú.

## Đọc trước khi làm
- `.claude/context/auth.md`, `.claude/context/api-contract.md`
- `app/frontend/src/context/AuthContext.tsx`, `src/pages/Login.tsx`, `src/data/users.ts`
- `app/backend/.../Controllers/AuthController.cs`

## Tiêu chí hoàn thành
- [ ] Đăng nhập 3 tài khoản demo bằng API, vào đúng dashboard
- [ ] Sai mật khẩu thì hiện "Email hoặc mật khẩu không đúng" (message từ BE)
- [ ] Token hết hạn / bị thu hồi thì tự về trang đăng nhập
- [ ] Không page nào khác phải sửa
