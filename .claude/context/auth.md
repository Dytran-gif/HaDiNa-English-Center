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

## Frontend — hiện trạng 2026-10-30

- AuthContext hiện có user/token/loginApi/login/logout/replaceToken. Session {user,token} cùng khóa ecw_auth_user; đọc được session demo cũ.
- Login mặc định loginApi gửi POST /api/auth/login; checkbox demo dùng login đồng bộ tra src/data/users.ts. Không tạo context/token store thứ hai.
- services/admin/useAdminApi nhận token context, gắn Bearer, logout khi 401. ProtectedRoute vẫn giữ role/redirect ban đầu.
- Đổi mật khẩu Admin nhận token mới và gọi replaceToken; không dùng token cũ. Username admin hiện có thể là email vì BE chưa có họ tên; UI không bịa tên thật.
- Đợt UI plan 24 không thay auth/phân quyền hoặc route; chỉ hiển thị thông tin user/logout có sẵn.
## Luật

- Route mới ở BE bắt buộc có `[Authorize]` (qua base hoặc attribute). Endpoint public phải ghi rõ `[AllowAnonymous]` và nằm trong `Controllers/Public/`.
- Không bao giờ trả `PasswordHash` ra JSON.
- Không tin `studentId`/`teacherId` gửi từ client cho dữ liệu "của tôi". Lấy từ token.
