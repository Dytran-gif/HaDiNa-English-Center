## Code Review — 25-fe-admin-dashboard-settings-polish

**Kết luận:** PASS trong phạm vi code; chưa xác minh trực quan bằng trình duyệt.

### Phát hiện

- Không phát hiện lỗi chặn. Ba quick action giữ nguyên đích điều hướng, dùng cùng icon SVG, flex canh trái/gap12/nút40; mobile chuyển một cột.
- KPI dùng một lớp Link/thẻ, giữ số liệu minh họa và route tương ứng; CSS có lưới 4/2/1, recent courses dùng SectionCard/Badge chung.
- `app/frontend/src/pages/admin/Layout/AdminLayout.tsx:40` — Hai điều kiện banner được gộp thành một Notice; thông báo minh họa vẫn giữ khi đăng nhập thật vào trang chưa nối API.
- `app/frontend/src/pages/admin/Settings/Settings.tsx:73` — Lỗi tải thật có nút thử lại bên trong Notice. Form demo được khóa và không thêm cảnh báo đỏ giả; payload và `replaceToken` giữ nguyên.
- `app/frontend/src/pages/admin/Layout/AdminLayout.css:4` — Skip-link được ẩn bằng clipping khi chưa focus, vẫn phục hồi khi focus; không xóa lối tắt truy cập.
- [INFO] Diff không thay BE, API services, AuthContext, routes hoặc dependencies. Token/style bổ sung đều giới hạn trong Admin.
- [INFO] Chưa có browser tool để kiểm tra bố cục, focus và viewport thực tế. Nguồn viền góc trái phù hợp với skip-link trong code nhưng chưa thể đối chiếu ảnh.

### Tóm tắt

Các thay đổi phù hợp Việc 1–5 và tái dùng bộ UI hiện có. Không có mục chặn cần sửa từ review code; cần QA trực quan khi trình duyệt khả dụng.
