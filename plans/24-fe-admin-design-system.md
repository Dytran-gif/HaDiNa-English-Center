# 24 — FE Admin: design system và trải nghiệm (5 đợt)

- **Loại:** plan
- **Vùng:** Admin FE
- **Người làm:** Codex
- **Ngày:** 2026-10-30
- **Độ khó:** Vừa

## Phạm vi lần chạy này — Đợt 1
F2: token scoped Admin, bộ thành phần dùng chung, sidebar/header; cuối đợt cập nhật F4 + tracker. F3-A.1–3 sang đợt 2; các trang khác/toast theo thao tác đợt 3; QA responsive/a11y đợt 4; đề xuất Public đợt 5 chờ chủ vùng. Không sửa BE/API/auth/routes.

## Đọc trước khi làm
CLAUDE.md, app/frontend/CLAUDE.md, context frontend/ownership/api-contract/auth/datetime, frontend conventions, handoff, plans/README, harness plan/implement/validate/review/handoff và code-reviewer, ADMIN-SPEC, code thực tế.
Mẫu: components/ui/Button.tsx:14, FormField.tsx:38, Modal.tsx:12; AdminLayout.tsx:11, Sidebar.tsx:7, Header.tsx:9; Components/Api/AdminUi.tsx:2. Tái dùng Button/FormField/Tag nền qua adapter Admin; native dialog cho focus/modal/confirm/drawer.

## Ảnh hưởng vùng khác
- Chỉ code dưới pages/admin và data/AdminData/sidebarMenuItems.ts. Token --admin-* nằm dưới .admin-layout; không sửa token root hoặc component global để không ảnh hưởng Teacher/Student/Public.
- Tài liệu shared được người dùng yêu cầu cập nhật (F4): conventions/context/frontend, CLAUDE mô tả hiện trạng, api-contract/auth docs (chỉ nội dung), TECH-STACK và docs/design/DESIGN-SYSTEM.md. Không thay logic auth/API.
- Public thuộc Hoàng, ghi đề xuất ⏸ trong ADMIN-FE-TRACKER, không sửa trang chủ.
- Không dependencies mới. Icon SVG tự viết cùng viewBox/stroke.

## Các task theo thứ tự
1. [x] Tạo tracker toàn bộ F2/F3-A/F3-B/F4 và khảo sát baseline; token + Button/FormField/icon/Notice. Docs design cập nhật cùng nhóm. Kiểm tra build + lint.
2. [x] EmptyState/TableSkeleton/Toast/ConfirmDialog/Badge/Pagination; nối adapter component đang dùng mà không đổi nghiệp vụ; cập nhật tracker/docs. Kiểm tra build + lint.
3. [x] Sidebar chia 5 nhóm, SVG thống nhất, drawer mobile có focus/Escape; header tên/email/logout, dùng AuthContext nguyên trạng. Kiểm tra build + lint.
4. [x] Rà tài liệu hiện trạng, handoff/plans, tự review; build/lint/typecheck + script kiểm tra; ghi giới hạn ảnh chụp.

## Rủi ro / quyết định
- Primary global hiện đỏ: chỉ override trong Admin, không đổi global Button.
- Một warning Fast Refresh ở AuthContext đã có sẵn; không sửa hoặc suppress vì F1 cấm đổi auth. Lint phải 0 lỗi, ghi warning rõ.
- Không gom demo/error trong đợt này (F3-A.1 thuộc đợt 2); chỉ tạo Notice hỗ trợ phân loại.
- Native dialog không portal ra body để giữ token scope Admin; close/focus restore do dialog quản lý.
- Browser/native pipe hiện unavailable; không chụp được trước/sau. Không nói đã QA hình ảnh hoặc 1440/1024/390.

## Tiêu chí
- [x] Build + lint 0 lỗi sau từng nhóm; typecheck xanh; không any/suppress/deps mới.
- [x] Bộ UI đủ trạng thái và có tài liệu API dùng lại.
- [x] Sidebar/header không đổi route, auth, API hay dữ liệu nghiệp vụ.
- [x] Tracker đúng trạng thái; docs hiện trạng phân biệt API thật và demo.

## Kết quả đợt 1
F2 và F4 xong theo code/build/docs. 28 kiểm tra UI SSR/contrast và 27 kiểm tra API/session cũ PASS. Không chụp ảnh/QA viewport thật do browser host unavailable. F3-A.1–3 là đợt kế tiếp, F3-B ⏸ chủ vùng Public. Báo cáo implementation/review trong reports/24-fe-admin-design-system-*.md.
