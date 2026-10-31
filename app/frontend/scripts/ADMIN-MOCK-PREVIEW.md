# Chạy ADMIN với JSON mẫu

Từ `app/frontend`:

```powershell
node scripts/admin-mock-preview.mjs E:\EIU\Project\admin-mock.json
```

Mở http://127.0.0.1:5174/admin/courses . Bản thử tự đăng nhập admin mẫu trên origin riêng; nếu đăng nhập lại: `admin@demo.com` / `123456`.

- Dùng Vite đã có, không cài thư viện; không sửa config, auth, service, backend hay DB.
- JSON nguồn chỉ đọc. Các API giả ghép khóa/lớp/học viên/ghi danh/phiếu thu và trả đúng field FE hiện dùng, hỗ trợ tìm kiếm/lọc/phân trang và một số thao tác CRUD để thử UI.
- Dashboard, Báo cáo được thay nguồn mock trong bộ nhớ khi Vite phục vụ module; Blog được seed một lần vào localStorage của port 5174. Nội dung HTML của bài được chuyển sang văn bản cho trình xem hiện tại; thumbnail SVG được phục vụ từ route local.
- API sửa/xóa chỉ ở bộ nhớ, mất khi khởi động lại. Blog lưu riêng trong localStorage; để seed lại Blog, xóa `admin_blog_v2` và `admin_mock_seed_v1` trên origin 5174 rồi tải lại.
- Đây là mô phỏng UI, không kiểm chứng validation, transaction, bảo mật hoặc nghiệp vụ của ASP.NET. Không bổ sung các tính năng còn thiếu theo audit. Đơn giáo viên trả danh sách rỗng vì JSON không có đơn.
- Luồng thường `npm run dev` và production build không sử dụng script này. Không triển khai script preview lên máy chủ. Dừng bằng Ctrl+C ở terminal chạy script.
