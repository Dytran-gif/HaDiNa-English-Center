---

## 🔄 Bàn giao — [15-08-2026]

### ✅ Đã xong: Nền đăng nhập dùng chung (auth)
- `src/context/AuthContext.tsx` — nhớ ai đang đăng nhập, có `login()` / `logout()`, lưu localStorage.
- `src/components/ProtectedRoute.tsx` — chặn theo vai trò.
- Route đã bảo vệ: `/student`, `/teacher`, `/admin`.
- 3 dashboard rỗng làm chỗ cắm: `src/pages/student|teacher|admin/index.tsx`.
- Trang Login đã nối vào auth, đăng nhập xong tự nhảy vào dashboard theo vai trò.

### 🔑 Tài khoản demo (mật khẩu chung: `123456`)
- `student@demo.com` → dashboard học viên
- `teacher@demo.com` → dashboard giáo viên
- `admin@demo.com` → trang quản trị

### 👉 Việc tiếp theo cho 2 bạn (dashboard)
- Mở đúng thư mục vai trò của mình trong `src/pages/<role>/`, lấp nội dung + giao diện vào.
- Lấy người đang đăng nhập: `const { user, logout } = useAuth();` (từ `src/context/AuthContext`).
- KHÔNG tự tạo auth/context mới — dùng lại nền đã có.
- Cần component chung (Button, Card...) thì lấy trong `src/components/ui/`, đừng chế lại.

### ⚠️ Bẫy cần biết
- Trang nào cần đăng nhập phải bọc `<ProtectedRoute role="...">` trong `routes.tsx`.
- Dữ liệu lấy từ `src/data/` — KHÔNG dùng `/data/*.json` ở gốc repo (dữ liệu cũ).
- Trước khi push: `npm run lint && npm run typecheck` phải xanh.

### 📌 Trạng thái phân công
- Hoàng: trang chủ + nền auth (xong phần auth).
- ⟨Duy⟩ / ⟨Nam⟩: dashboard student/teacher/admin (đang làm).