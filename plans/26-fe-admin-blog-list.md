# 26 — FE Admin Blog: danh sách, đợt 1

- **Loại:** plan
- **Vùng:** Admin FE
- **Ngày:** 2026-10-30

## Phạm vi
Việc1 + Việc6 theo yêu cầu mới. Không triển khai rich editor/chèn hình/preview HTML/gallery ở lần này. Giữ CRUD demo đang có, chuyển form tối giản khỏi modal sang màn riêng qua query /admin/blog?compose=new hoặc compose=<id>, không đổi route hiện có. Việc2 hoàn chỉnh sang đợt2.

## Đã đọc
CLAUDE gốc/FE; context frontend/ownership/api-contract/auth/datetime; conventions; ADMIN-SPEC Page7, ADMIN_API, DESIGN-SYSTEM, tracker/handoff; harness plan/implement/validate/review/handoff và code-reviewer.
Code: BlogManagement.tsx (form modal/localStorage admin_blog), data/blogPosts.ts, types/blogPost.ts, public BlogDetail.tsx (đoạn văn React); entity Post và AppDbContext (Title max250). Không có PostsController/HomepageImagesController/Admin upload; Teacher Files không phải endpoint Admin.

## Task
1. [x] Model/repository demo an toàn, migration đọc kho admin_blog cũ, không gọi endpoint chưa có; docs yêu cầu BE. Build/lint.
2. [x] Danh sách: thumbnail/fallback, tìm300ms/filterstatus, badge/date/icon action, skeleton/empty, pagination, ConfirmDialog/toast; giữ form tối giản và preview văn bản an toàn, không modal soạn. Build/lint.
3. [x] Notice Blog inline cùng hàng desktop, xuống hàng mobile. Docs/tracker/design/handoff/plans, review, validation.

## Ảnh hưởng vùng khác
Chỉ pages/admin và Ui chung Admin, optional prop SearchField/Pagination/Notice tương thích callers cũ; Layout bật inline notice riêng Blog. Không sửa routes, API client/AuthContext/BE/DB/Public hoặc dependencies. Không thêm Tiptap/DOMPurify vì quy ước cấm cài thư viện; đợt2 dự kiến contentEditable tối giản, đợt3 cần sanitizer allowlist được kiểm tra trước khi render HTML.

## Quyết định
Kho demo riêng v2 giữ bản admin_blog cũ, không sửa mock public. Danh mục legacy chỉ hiển thị badge demo, không đưa vào API hoặc form vì Post không có Category. Preview đợt1 hiển thị plain text qua React p (escape HTML), không dangerouslySetInnerHTML; preview HTML/rich text đợt3. Draft ngày hiển thị —. Sau lưu draft giữ màn soạn, Published quay về list, toast nói rõ lưu cục bộ.

## Kiểm tra
npm.cmd run lint/build sau mỗi nhóm; typecheck cuối; node scripts/verify-admin.mjs và Ui/verify-ui.mjs; kiểm tra repository migration/filter/date/storage error. Không browser tool nên không tuyên bố ảnh/QA viewport hoặc keyboard tương tác.

## Kết quả
Đợt1 Việc1+6 xong theo code/build/docs; 16 kiểm tra Blog và55 kiểm tra cũ PASS, review PASS. UI tương tác/viewport chưa kiểm tra do không có browser. API posts/gallery/upload và fields thiếu đã ghi ⏸. Tiếp đợt2 editor không hình; không coi form văn bản demo là hoàn tất Việc2.
