## Code Review — 26-fe-admin-blog-list

**Kết luận:** PASS trong phạm vi đợt 1; chưa xác minh tương tác và bố cục bằng trình duyệt.

### Phát hiện

- Không phát hiện lỗi chặn. Danh sách có tìm kiếm/lọc, skeleton, EmptyState, badge, phân trang và thao tác icon có nhãn.
- `app/frontend/src/pages/admin/Blog/demoPosts.ts:25` — Kho v2 đọc được dữ liệu cũ, giữ nguyên bản `admin_blog`; lỗi đọc/lưu được báo rõ, không giả lưu thành công.
- `app/frontend/src/pages/admin/Blog/BlogManagement.tsx:66` — Xóa có xác nhận tên bài; lỗi được chuyển thành một Toast, không đồng thời phát lỗi inline trùng lặp.
- `app/frontend/src/pages/admin/Blog/PostTextPreview.tsx:4` — Preview dùng văn bản React được escape, không thực thi HTML hoặc dùng `dangerouslySetInnerHTML`.
- `app/frontend/src/pages/admin/Layout/AdminLayout.tsx:40` — Notice inline chỉ bật cho Blog; các props mới của Notice, Pagination, SearchField và ConfirmDialog giữ mặc định tương thích callers cũ.
- [INFO] Không thay backend, API services, AuthContext, routes hoặc dependencies. Không gọi endpoint posts/upload chưa tồn tại.
- [INFO] Form compose hiện chỉ là bản demo văn bản tối giản trên query của route cũ. Rich editor, HTML sanitizer, chèn ảnh và gallery vẫn thuộc các đợt sau.
- [INFO] Chưa kiểm tra viewport 1440/1024/390, focus/dialog/toast thực tế vì trình duyệt không khả dụng.

### Tóm tắt

Thay đổi phù hợp phạm vi danh sách Blog đợt 1 và giữ được CRUD demo. Không có mục chặn từ review code; cần QA trình duyệt và hoàn thiện các đợt editor/ảnh sau.
