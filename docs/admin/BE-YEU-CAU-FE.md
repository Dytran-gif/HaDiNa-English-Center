# BE cần cho FE Blog/Homepage

Cập nhật 2026-10-30. Đây là đề xuất cho người phụ trách BE, KHÔNG phải API đã tồn tại. FE không gọi các endpoint dưới đây khi chưa có code/hợp đồng chốt. Entity Post hiện chỉ có Id/Title(max250)/Content/ThumbnailUrl/Status/PublishedAt/CreatedAt; chưa có controller posts/homepage-images/Admin upload.

| Mã | Endpoint/field cần | Request / response đề xuất | Giới hạn và lý do | Spec |
|---|---|---|---|---|
| BE-BLOG.1 | GET /api/admin/posts | page,pageSize,search,status → {items:[{id,title,thumbnailUrl,status,publishedAt}],total,page,pageSize} | Lọc title/status, mới nhất trước; admin-only; cần chuẩn hóa message lỗi | 7.1.1 |
| BE-BLOG.2 | GET /api/admin/posts/{id} | → {id,title,content,thumbnailUrl,status,publishedAt} | Cần tải edit/preview; 404 message rõ | 7.1.2 |
| BE-BLOG.3 | POST /api/admin/posts; PUT /api/admin/posts/{id} | {title,content,thumbnailUrl,status}; response Post DTO | Title1–250; Published nội dung không rỗng, PublishedAt giờ địa phương; sanitize HTML ở server trước lưu | 7.1.2 |
| BE-BLOG.4 | DELETE /api/admin/posts/{id} | 204; lỗi {message} với404/409 phù hợp | Xác nhận xóa, FE hiển thị nguyên message | 7.1.3 |
| BE-BLOG.5 | POST /api/admin/posts/images | multipart field file → {url:"/uploads/posts/..."} | jpg/png/webp, ≤5MB, kiểm tra chữ ký/tên file/dung lượng ở server; FileStorageService; dùng cho cover và ảnh nội dung | 7.1.2, đợt3 FE |
| BE-BLOG.6 | Bổ sung excerpt/thumbnailAlt; cân nhắc category/slug | Chốt tên/length/schema trước thêm DTO | Excerpt phục vụ thẻ public; ảnh cần alt; category/slug chỉ có ở mock FE, không có trong entity/spec hiện tại. FE ẩn form danh mục, không tự gửi các field này. | 7.1.2,7.3.1; yêu cầu bổ sung của user |
| BE-BLOG.7 | GET/POST/DELETE /api/admin/homepage-images; PUT /order | Upload multipart file+altText → {id,url,altText,sortOrder}; order nhận mảng id | jpg/png/webp ≤5MB, admin-only, validate toàn bộ mảng order/không trùng/thiếu ID, không sửa từng phần | 7.2.1 |
| BE-BLOG.8 | GET /api/public/posts; GET /api/public/homepage-images | Chỉ Published, mới nhất trước; ảnh theo sortOrder | Không lộ trường nội bộ, không auth; chốt component/model public sau | 7.3.1 |

## HTML và ảnh

Backend sanitizer phải hỗ trợ allowlist p,h2,h3,ul,ol,li,strong,em,a,img,blockquote,br. Loại script/event handlers và URL nguy hiểm; link ngoài target=_blank + rel=noopener noreferrer. img src/alt chỉ URL ảnh hợp lệ/nguồn do trung tâm kiểm soát; không cho blob:/data: vào bài đã đăng. FE đợt3 cũng cần sanitize trước render, không thay thế server sanitizer.

Hiện FE chỉ lưu demo trên trình duyệt; danh sách/preview văn bản được React escape. Chưa upload thật, chưa ghi trạng thái thành công máy chủ giả. Các mục trên ⏸ trong tracker tới khi BE có implementation và API contract được cập nhật.
