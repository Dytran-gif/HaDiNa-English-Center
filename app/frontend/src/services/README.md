# src/services — giao tiếp API

`apiClient.ts`: fetch, gắn token được truyền từ AuthContext, chuẩn hóa message và ProblemDetails, xử lý 204, network và abort. `admin/useAdminApi.ts`: API Admin có token, logout khi 401, hook query có loading/error/abort và tùy chọn tải hết trang cho danh mục chọn.

Các trang Admin dùng type camelCase riêng trong `src/types/adminApi.ts`, không thay model snake_case cũ của Teacher/Student. Không thêm thư viện. Đăng nhập thật gọi API qua apiClient trong AuthContext; login demo cũ vẫn giữ để xem giao diện khi chưa có DB.

Development dùng Vite proxy /api, /uploads tới http://localhost:5220; production cần reverse proxy tương ứng hoặc VITE_API_URL và CORS phù hợp. Xem docs/admin/FE-ADMIN.md.
