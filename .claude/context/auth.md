# Đăng nhập & phân quyền

## Backend (đã chạy)

- `POST /api/auth/login` với body `{ "email", "password" }` trả `{ token, userId, email, role }`.
  - Sai email hoặc mật khẩu: 401 `{ message: "Email hoặc mật khẩu không đúng" }` (cùng một câu để không lộ email tồn tại).
  - Tài khoản khóa: 403.
- `GET /api/auth/me` trả `{ email, role }` (cần token).
- Token JWT HS256, cấu hình `Jwt:Key|Issuer|Audience|ExpireHours` trong `appsettings.json` (mặc định 8 giờ).
- Claims: `NameIdentifier` = `User.Id`, `Email`, `Role` (`admin|teacher|student`), `tokenVersion`.
- **Thu hồi token**: mỗi request, `Program.cs` (`OnTokenValidated`) so `tokenVersion` với DB và kiểm tra `IsLocked`. Tăng `User.TokenVersion` = đăng xuất mọi nơi (đổi mật khẩu, logout, admin khóa tài khoản).
- Phân quyền theo vai trò bằng `[Authorize(Roles = "admin")]`, hoặc qua lớp base của portal (`[Authorize(Roles = "teacher")]`).
- Phân quyền theo **dữ liệu** (giáo viên chỉ thấy lớp mình…) làm trong lớp base và từng action. Xem `backend.md`.

## Mô hình tài khoản

`User` (đăng nhập) ↔ 1-1 `Teacher` hoặc `Student` (hồ sơ). Admin chỉ có `User`.
Admin tạo giáo viên/học viên kèm `TempPassword`. Reset mật khẩu: `POST api/admin/{teachers|students}/{id}/reset-password`.

Tài khoản demo (seed, mật khẩu `123456`): `admin@demo.com`, `teacher@demo.com`, `student@demo.com`.

## Frontend (đang mock, plan 03 chuyển sang API)

- `src/context/AuthContext.tsx`: `useAuth()` trả `{ user, login, logout }`. User lưu ở `localStorage["ecw_auth_user"]`.
- `login()` hiện tra `src/data/users.ts` (mock) và chạy **đồng bộ**.
- `ProtectedRoute role="teacher"`: chưa đăng nhập thì về `/dang-nhap`, sai vai trò thì về `/`.

### Khi chuyển sang API (plan 03)
- `login` thành `async`: gọi `POST /api/auth/login`, lưu `{ token, role, email, userId }`, sau đó lấy hồ sơ (vd `GET /api/teacher/profile`) để có `fullName`.
- `apiClient` đọc token từ cùng chỗ lưu và gắn `Authorization: Bearer`.
- Gặp 401 thì `logout()` rồi chuyển về `/dang-nhap`.
- Giữ nguyên chữ ký `useAuth()` để các page không phải sửa (chỉ `Login.tsx` cần `await`).

## Luật

- Route mới ở BE bắt buộc có `[Authorize]` (qua base hoặc attribute). Endpoint public phải ghi rõ `[AllowAnonymous]` và nằm trong `Controllers/Public/`.
- Không bao giờ trả `PasswordHash` ra JSON.
- Không tin `studentId`/`teacherId` gửi từ client cho dữ liệu "của tôi". Lấy từ token.
