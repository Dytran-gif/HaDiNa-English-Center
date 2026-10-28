# 21 — BE Admin: blog + ảnh trang chủ

- **Loại:** backlog
- **Vùng:** Admin
- **Người làm:** ⟨cần điền⟩
- **Phụ thuộc:** —
- **Độ khó:** Thấp

## Phạm vi
- `Controllers/Admin/PostsController.cs` (`api/admin/posts`): CRUD + `POST /{id}/publish`, `POST /{id}/unpublish` (set `PublishedAt` bằng `AppTime.Now`). Entity `Post` đã có.
- `Controllers/Admin/HomepageImagesController.cs` (`api/admin/homepage-images`): CRUD + sắp xếp `SortOrder`.
- Upload ảnh: tái dùng `FileStorageService` (cần endpoint `POST /api/admin/files?folder=posts`).
- Cập nhật `docs/api/ADMIN_API.md`.

## Tiêu chí hoàn thành
- [ ] Bài `Published` đọc được qua Public API (plan 40)
- [ ] `dotnet build` xanh
