# Frontend — React + Vite + CSS thuần

Gốc: app/frontend. Quy ước: docs/conventions/FRONTEND.md. Design Admin: docs/design/DESIGN-SYSTEM.md. Hiện trạng xác minh 2026-10-30.

## Cấu trúc và vùng

- src/routes.tsx giữ route/ProtectedRoute theo role, là file dùng chung.
- src/context/AuthContext.tsx giữ user/token/loginApi/login demo/logout/replaceToken; không tạo context auth thứ hai.
- src/components/ui là nền dùng chung Public/Teacher/Student/Admin.
- src/pages/admin/Components/Ui là adapter Admin: Button, FormField, Notice, EmptyState, TableSkeleton, Badge, Pagination, Dialog/ConfirmDialog và ToastProvider/useToast. Icon SVG tự viết thống nhất.
- src/pages/admin/Layout, Components/Sidebar, Components/Header là shell Admin; sidebar 5 nhóm, drawer dưới 48em, header có tên/email/logout.
- src/pages/admin/Components/Api chứa ResourcePage, resourceConfigs, SearchField, adminFormat và adapter Feedback/Pager.
- src/services/apiClient.ts gọi fetch/chuẩn hóa lỗi; services/admin/useAdminApi.ts nhận token context, gắn Bearer, logout 401, query có abort/loading/error. Type API: src/types/adminApi.ts.
- src/data giữ demo theo vùng; hooks/useLocalCollection còn dùng ở trang minh họa.

## Hiện trạng dữ liệu

7 trang Admin dùng API thật: Khóa học, Giáo viên, Học viên, Lớp học, Học phí, Phòng học, Cài đặt. Đơn giáo viên đã gỡ khỏi FE/BE Admin theo yêu cầu 2026-10-31. Dashboard/Blog/Reports còn minh họa có nhãn; không mô tả toàn bộ Admin là mock hoặc đã nối hết.

/admin/users redirect sang /admin/students. Đăng nhập thật mặc định gọi POST /api/auth/login; lựa chọn demo để xem UI khi chưa có DB, không giả lưu API thành công. Layout đã gộp demo/minh họa thành một Notice info (plan25). Settings không có lỗi đăng nhập giả khi demo; các bảng/trang khác còn cần EmptyState trung tính.

## Styling

CSS thuần. Root tokens tại src/styles/tokens.css cho nền; Admin có một nguồn riêng tại pages/admin/Components/Ui/AdminTokens.css, selector .admin-layout, biến --admin-* và alias nội bộ. Không đổi root hoặc Public/Teacher/Student để sửa Admin.

Tái dùng Button/FormField/Tag nền qua adapter Admin. Primary xanh, danger chỉ xóa/lỗi, disabled xám, focus rõ. Chi tiết API và thang 4/8px trong DESIGN-SYSTEM. Không thêm thư viện icon/UI.

## Thêm/sửa trang

Route mới cần đúng vùng/ProtectedRoute, cập nhật menu/title. Tái dùng Ui/Api của Admin. Page không fetch trực tiếp; xử lý loading/rỗng/lỗi, không dùng any. Model snake_case cũ giữ nguyên; trang API mới dùng camelCase. Tiền vi-VN/VND, ngày dd/MM/yyyy; không đổi DateOnly/TimeOnly sang UTC.

ApiError có status/message/fieldErrors; nhận cả message/errors và ProblemDetails errors. FormField nhận error/help nối aria-describedby. Mỗi tình huống chỉ một thông báo. Toast cho từng mutation áp dụng ở F3 đợt 3; Foundation F2 không đồng nghĩa đã gắn mọi thao tác.

## Kiểm tra

Tại app/frontend: npm.cmd run lint; npm.cmd run typecheck; npm.cmd run build. Dùng npm.cmd nếu PowerShell chặn npm.ps1. node scripts/verify-admin.mjs kiểm tra API/session/SSR. node src/pages/admin/Components/Ui/verify-ui.mjs kiểm tra UI SSR/contrast. Không thay thế browser/E2E.

Vite proxy /api và /uploads tới localhost:5220 ở dev. Production cần reverse proxy hoặc VITE_API_URL + CORS. Không khởi động BE để test FE nếu DB chưa sẵn sàng vì BE tự migrate/seed.

QuickActions/SectionCard/AdminPanels.css là composition dùng chung cho Dashboard/Cài đặt. Quick actions link giữ action=create, dashboard số liệu vẫn minh họa; token typography/radius bổ sung theo DESIGN-SYSTEM. Không sửa Dashboard.css cũ vì Reports vẫn đang dùng. Settings có dirty state, password help/match khi gõ và retry trong Notice thực; API/auth không đổi.
