# Báo cáo thực hiện — 26 Blog đợt 1

Ngày 2026-10-30 · Vùng Admin FE · Plan plans/26-fe-admin-blog-list.md

## Kết quả

| Nhóm | Kết quả |
|---|---|
| Toolbar/tìm/lọc | XONG; tiêu đề/count, search300ms có icon/placeholder, status kết hợp page |
| Table | XONG; thumbnail56x40/fallback, title2 dòng, Badge category legacy/status, Draft ngày—, dd/MM/yyyy, icon accessible/tooltip |
| Pagination/loading/empty | XONG; Trang x/y · N bài viết, skeleton, empty ban đầu/khi lọc, vùng table cuộn ngang |
| Xóa | XONG demo; ConfirmDialog nêu tên bài, success/failure toast, không giả thành công khi storage fail |
| Thêm/sửa/preview entry | Giữ chức năng demo cũ bằng màn query compose, không modal. Form văn bản tối giản, preview React escape; editor/HTML mới chưa làm |
| Notice | XONG; một info của Layout, action inline desktop/row mobile riêng Blog |
| API/fields/upload | ⏸; chỉ entity có sẵn, chưa có controller posts/homepage/Admin upload; ghi 8 yêu cầu BE |

## Phạm vi thay đổi

BlogManagement thay UI và adapter demo. Tạo postTypes/demoPosts/DemoPostEntry/PostTextPreview/verify-blog dưới pages/admin/Blog; shared style AdminContent.css/token và SVG placeholder trong Ui. Pagination thêm itemLabel, SearchField thêm placeholder, Notice thêm inlineAction, ConfirmDialog thêm onFailure, đều optional tương thích callers cũ. Layout chỉ bật inlineAction cho Blog. Không sửa backend/DB/route/auth/API client/global UI/Public/dependencies.

## Kiểm tra

- npm.cmd run lint/build sau mỗi nhóm: PASS (0 lỗi, 1 warning AuthContext baseline).
- npm.cmd run typecheck cuối: PASS.
- node src/pages/admin/Blog/verify-blog.mjs: 16/16 PASS.
- node scripts/verify-admin.mjs: 27/27 PASS; Ui/verify-ui.mjs: 28/28 PASS.
- git diff --check: PASS.

16 kiểm tra Blog gồm migration legacy, không ghi đè backup, draft/date, search+status, title/content validation, quota failure giữ dữ liệu, delete/reload, clamp page, URL cover nguy hiểm, corruption không bị ghi đè, preview hostile HTML React escape, SSR list/skeleton. Không chạy BE/DB, không mô phỏng bằng endpoint giả.

## Quyết định và giới hạn

- Không cài editor library vì convention cấm thêm dependencies. Đợt2 dự kiến contentEditable; đợt3 cần sanitizer allowlist được kiểm tra trước HTML. Hiện nội dung plain text render qua React p, không dangerouslySetInnerHTML; script/onerror không thành DOM thực thi.
- Post BE thiếu Category/Excerpt/Slug/ThumbnailAlt. Danh mục legacy chỉ giữ ở table minh họa, không mở card edit/gửi field giả. Chưa viết HTTP posts service tới endpoint không tồn tại.
- Kho v2 copy-on-write, backup admin_blog giữ nguyên; storage lỗi/corruption báo rõ, không reset data ngầm. Không thay seed Public.
- Chuyển status cũng tính là thay đổi: draft có thể đăng mà không phải sửa lại text; Published có thể lưu nháp. Draft giữ màn compose, Published về list.
- Query compose giữ route /admin/blog, tránh link404 và tránh làm mất CRUD demo cũ. Đây không phải hoàn tất Việc2: chưa rich toolbar/layout2 cột/cover/unsaved warning/editorfull.
- Confirm failure handler đóng dialog rồi toast một lần để toast không bị native dialog che; callers cũ vẫn inline error mặc định. Server message sẽ giữ nguyên khi BE thực có; hiện không tuyên bố đã test lỗi server.
- Không có browser tool, chưa QA ảnh/keyboard thật tại1440/1024/390. CSS có wrap/scroll/focus; SSR không thay browser.

## Đợt sau

1. Editor đầy đủ 2 cột, title/excerpt theo field BE chốt.
2. Toolbar contentEditable/validation/unsaved warning, chưa hình.
3. Hoàn thiện save/load/error states và API khi BE đã có; sau đó đợt3 ảnh+preview HTML, đợt4 gallery.
