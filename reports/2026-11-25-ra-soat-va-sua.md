# Rà soát & sửa 25/11/2026 (Duy + Claude)

Danh sách lỗi gốc, phân tích, ảnh demo: xem Docs "Rà soát HaDI English Center" (đã gửi nhóm). File này ghi lại **đã làm gì** và **cần kiểm tra gì**.

## Đã làm
| Vùng | Việc |
|---|---|
| Public | Menu hover chỉ mở ở thiết bị có chuột; cảm ứng dùng nút ▾; menu mobile accordion, bỏ ký tự "−". Đăng ký 3 bước, kiểm tra từng ô, đăng nhập luôn. Login/đăng ký mobile: chữ clamp, chừa chỗ lỗi nên form không nhảy. Trang GV lấy API (tên/ảnh từ bảng Teachers, khóa dạy, sao). Đánh giá hiện tên rút gọn + lớp. Tiêu đề trang + favicon. |
| Student | Đăng ký theo **lớp** (1 khóa nhiều lớp), BE chặn trùng lịch/đủ sĩ số/đã học khóa. Đang/Sắp/Đã học dạng segmented. Lịch sử dạng thư mục theo năm. Bấm nhắc lịch & buổi trong lịch → popup chi tiết. Học phí: báo đã chuyển khoản → chờ trung tâm xác nhận (bỏ nút tự đánh dấu đã đóng). Đánh giá GV. |
| Teacher | Tìm lớp theo tên/mã, mã lớp ở mọi màn. Bài tập giao theo lớp (hoặc mọi lớp của khóa). Hồ sơ public + xem đánh giá. |
| Admin | Học phí: KPI, tab Chờ xác nhận / Công nợ / Tất cả phiếu, thu nhiều đợt, hủy phiếu có lý do, hoàn tiền. Lớp: mã lớp, cảnh báo trùng lịch HV khi đổi lịch. Ghi danh: ưu đãi riêng + lý do, tính theo buổi còn lại. Khóa: mã, slug, ảnh, ẩn/hiện web. Trang duyệt đánh giá. Doanh thu chỉ tính phiếu đã xác nhận. |
| DB | Migration `20261125160000_ClassCodesPaymentsReviews` (viết tay). |

## Chưa làm
- Blog vẫn đọc localStorage (plan 21).
- Gửi email/thông báo khi phiếu được xác nhận/từ chối.

## Bắt buộc kiểm tra trên máy có NuGet + SQL Server
1. `dotnet build`
2. `dotnet ef migrations has-pending-model-changes` → *No changes* (snapshot sửa tay).
3. Backup DB → `dotnet ef database update`.
4. Thay `Payment:Bank` trong appsettings bằng tài khoản thật (đang là số mẫu).
5. Chạy luồng: HV đăng ký → chọn lớp → báo CK → Admin xác nhận → doanh thu/biên lai.
