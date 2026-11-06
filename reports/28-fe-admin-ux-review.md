## Code Review — 28-fe-admin-ux

**Kết luận: PASS — phạm vi desktop**

### Phát hiện

- Đã xử lý lỗi hủy tải hồ sơ khiến form Add/Edit bị kẹt loading trong `ResourcePage.tsx`.
- Các trang hồ sơ Học viên, Giáo viên và Lớp nằm dưới route Admin có bảo vệ; request vẫn đi qua service và API hiện có.
- Shape dữ liệu profile, roster, ghi danh và rút học viên khớp BE. Bộ lọc Học phí tải đủ các trang trước khi lọc ngày/hình thức.
- Modal Admin sử dụng Dialog hiện có; busy chặn đóng/chuyển học viên lúc lập phiếu. ActionMenu đưa focus về summary trước khi mở dialog, giúp khôi phục focus đúng.
- Lỗi mật khẩu cũ được xóa khi mở form reset cho tài khoản khác.
- Grid dùng `minmax(0, 1fr)` và giới hạn chiều rộng con để tránh cắt nội dung.
- Script browser chặn/intercept API, không gửi mutation tới DB thật; mặc định kiểm tra desktop, mobile chỉ chạy khi chủ động bật.
- [INFO] `routes.tsx` là file dùng chung; thay đổi chỉ bổ sung route hồ sơ Admin. Không thay auth, backend, schema hoặc dependency.
- Mobile đã được ghi thành to-do trong `FE-ADMIN.md`, chưa coi là nghiệm thu.

### Tóm tắt

Không còn vấn đề chặn trong diff desktop đã review. Bằng chứng validation ghi nhận: build/typecheck đạt, lint chỉ còn warning AuthContext cũ; 28 kiểm tra Admin, 28 UI, 16 Blog SSR và 17 kiểm tra browser desktop đạt. Mobile và kiểm tra bản in thực tế còn để đợt sau.
