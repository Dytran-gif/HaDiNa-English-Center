# Báo cáo thực hiện — 25 FE Admin Dashboard/Cài đặt

Ngày 2026-10-30 · Plan: plans/25-fe-admin-dashboard-settings-polish.md · Vùng: Admin FE

## Task

| Nhóm | Kết quả | Kiểm tra |
|---|---|---|
| 1. Quick actions | XONG | Flex trái/gap12, primary + secondary, icon plus SVG, height40/padding ngang16, dưới640 full-width một cột; action=create giữ nguyên |
| 2. Demo và góc trên trái | XONG code | Hai banner độc lập gộp một Notice info, action đăng nhập; main padding-top24; skip-link clip khi không focus và giữ Tab |
| 3. KPI | XONG | Một Link/thẻ, không Card/StatBlock lồng nhau; dữ liệu cũ giữ minh họa, link4 route; grid4/2/1 theo1200/640 |
| 4. Recent courses | XONG | Một SectionCard, ghost Xem tất cả, row≥48/divider/hover, Badge neutral |
| 5. Cài đặt | XONG | Hai SectionCard stretch, title18/600/gap16, input44/radius10/placeholder, disabled dễ đọc; footer cùng đáy, help/match, dirty save, retry trong Notice lỗi thực |

## File

- Tạo Ui/QuickActions.tsx, SectionCard.tsx, AdminPanels.css để tái dùng composition/style, không tạo CSS rời trong từng trang.
- Sửa Dashboard.tsx và Dashboard/Components/StatsOverview.tsx; không sửa Dashboard.css cũ vì Reports còn dùng.
- Sửa AdminLayout.tsx/CSS, thêm token typography/radius đúng yêu cầu vào AdminTokens.css, sửa Settings.tsx.
- Không sửa backend/API/route/auth/services, root tokens, global components, Public/Teacher/Student hoặc dependencies.
- Docs: DESIGN-SYSTEM, ADMIN-FE-TRACKER, FE-ADMIN, context/frontend, plans25/README và BAN-GIAO.

## Validation

| Lệnh | Kết quả |
|---|---|
| npm.cmd run lint sau từng nhóm | PASS 0 lỗi; 1 warning AuthContext Fast Refresh đã có sẵn |
| npm.cmd run build sau từng nhóm | PASS |
| npm.cmd run typecheck cuối | PASS |
| node src/pages/admin/Components/Ui/verify-ui.mjs | 28/28 PASS |
| node scripts/verify-admin.mjs | 27/27 PASS |
| Kiểm tra SSR tạm theo ngữ cảnh | 12 assertions đạt |
| git diff --check | PASS |

SSR mục tiêu: một Notice cho demo Dashboard, giữ link đăng nhập; Dashboard thật vẫn có nhãn minh họa, Settings thật không bị gắn demo; giữ ba đích action=create; bốn KPI một lớp; recent Badge; Settings demo không alert giả, hai panel/placeholder/help và controls disabled. Kiểm tra tạm qua stdin được sửa để không phụ thuộc Unicode PowerShell và không giả định trailing-space trong className.

## Quyết định

- Khoảng cách chung theo token4/8. Padding20 KPI, font13/18/32, radius10/12 dùng token vì là yêu cầu cụ thể; không thay đổi token control44 toàn Admin, chỉ quick buttons40.
- Source code của phần viền góc trái phù hợp nhất là skip-link fixed có border/radius nhưng trước chỉ translateY(-200%). Chuyển sang clipping/overflow/1px khi không focus; khi focus phục hồi. Không xóa accessibility. Chưa thể khẳng định hình ảnh thực tế khi không có browser tool.
- Không có token là trạng thái demo/info, không coi lỗi server trong Settings. Có token + lỗi query thật thì giữ message và nút retry bên trong Notice. Các bảng/trang khác chưa chuyển EmptyState không được đánh xong F3-A.1 toàn bộ.
- Center save chỉ bật khi thay đổi; password giữ endpoint/payload/replaceToken hiện có, thêm phản hồi match/help và khóa submit không hợp lệ. Không sửa logic login/phân quyền.
- KPI vẫn mock cũ và được gắn nhãn minh họa ở shell; không gọi API Dashboard chưa có.

## Giới hạn

Không có namespace/browser tool hiện tại nên không chụp được trước/sau hoặc đo kích thước thực tế ở viewport. Chỉ xác minh code/CSS/SSR, không tuyên bố đã QA trực quan. Không chạy BE/DB. Việc6 chỉ có tiêu đề NHỊP, không tự suy diễn nội dung. Các phần mẫu Khóa học/toast theo từng mutation và QA tổng thể vẫn theo tracker.

Review độc lập read-only theo skill review: PASS, không có lỗi chặn; kết luận lưu nguyên văn tại reports/25-fe-admin-dashboard-settings-polish-review.md. Không coi PASS code là đã QA hình ảnh.
