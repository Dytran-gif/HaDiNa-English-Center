# 25 — FE Admin: Dashboard và Cài đặt

- **Loại:** plan
- **Vùng:** Admin FE
- **Ngày:** 2026-10-30
- **Phạm vi:** Việc 1–5 theo yêu cầu mới. Việc 6 chỉ có tiêu đề “NHỊP”, không suy diễn thêm. Không sửa BE/API/route/auth hoặc thêm thư viện.

## Đọc và mẫu
CLAUDE gốc/FE, context frontend/ownership, conventions/frontend, DESIGN-SYSTEM, ADMIN-FE-TRACKER, handoff, harness implement/validate/review/handoff và code-reviewer. Đọc Dashboard.tsx/CSS, StatsOverview, Settings, AdminLayout/CSS, AdminTokens, Button/Notice/Badge/FormField, Card/StatBlock nền.

## Phát hiện
- Quick actions dùng admin-api-toolbar (justify-content:space-between), dấu cộng là ký tự văn bản.
- KPI Card bọc StatBlock; Reports còn dùng Dashboard.css nên không sửa CSS cũ làm ảnh hưởng Reports.
- Layout có 2 điều kiện banner độc lập, có thể cùng render khi token rỗng và route minh họa.
- Skip-link fixed ở góc trên trái có border/radius, chỉ ẩn bằng transform. Sửa clipping khi không focus, không xóa accessibility; không có browser để xác nhận ảnh.

## Task
1. [x] QuickActions, KPI một lớp, recent courses và shared SectionCard/style/token. Giữ link/action và số liệu minh họa cũ. Build + lint.
2. [x] Một Notice demo; padding-top nội dung 24px; skip-link không lộ viền khi không focus. Build + lint.
3. [x] Settings thẻ cân bằng, retry trong Notice, tiêu đề/nhãn/input nhất quán, help mật khẩu, placeholder, footer nút đồng bộ. Dirty form/match khi gõ theo tracker, giữ API/password/token hiện có. Build + lint.
4. [x] Tự review, test SSR hiện có + kiểm tra cấu trúc mới, docs/tracker/handoff/plans. Không tuyên bố browser QA khi tool không có.

## Ảnh hưởng vùng khác
Chỉ code pages/admin. Shared UI/SectionCard/QuickActions/style ở Components/Ui. Không sửa global components/ui, root tokens, routes, auth context, API client/services, package/deps. Tài liệu liên quan cập nhật theo harness. Padding 20px KPI và radius10/12 là yêu cầu cụ thể, dùng token; khoảng cách khác chỉ thang4/8.

## Kiểm tra
Tại app/frontend: npm.cmd run lint; npm.cmd run typecheck; npm.cmd run build; node scripts/verify-admin.mjs; node src/pages/admin/Components/Ui/verify-ui.mjs. Lint baseline có 1 warning AuthContext, không sửa ngoài scope. Browser tool không còn khả dụng, không thể ảnh trước/sau hoặc QA trực quan viewport.

## Kết quả
Việc1–5 hoàn tất theo code/build/docs. Build/lint/typecheck PASS (0 lỗi, 1 warning AuthContext baseline); 55 kiểm tra hiện có PASS, 12 assertions SSR mục tiêu đạt. Review độc lập PASS. Không có browser tool để xác minh hình ảnh/viewport; Việc6 không có nội dung ngoài tiêu đề.
