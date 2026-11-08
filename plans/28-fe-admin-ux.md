# 28 — Cải thiện UI/UX nhiều trang Admin

Ngày 2026-11-06. Phạm vi FE Admin và routes được người dùng cho phép; giữ API/auth/schema hiện có, không thêm thư viện.

## Các task theo thứ tự

- [x] 1. Adapter Modal Admin dùng Dialog có focus/Escape/backdrop/busy; xác nhận có tên đối tượng; action menu, skeleton/empty/toast dùng chung.
- [x] 2. Học viên/Giáo viên: profile route riêng, phân nhóm thông tin/lớp/học phí; giảm nút trên bảng; tìm kiếm chuyên môn có gợi ý giá trị thực.
- [x] 3. Khóa học: grid card desktop, band/badge giá/sĩ số, reuse form API; Phòng nhận trải nghiệm CRUD dùng chung.
- [x] 4. Lớp: profile route, thêm/rút HV ngay tại lớp, nhóm lịch và trạng thái; loading/error/empty/confirm; giữ filter/paging và editor.
- [x] 5. Học phí: bảng gọn, tìm/lọc hình thức/ngày trên toàn bộ kết quả tìm kiếm; modal lập phiếu không cho đóng/chuyển HV khi lưu, in biên lai.
- [x] 6. Dashboard tiêu đề theo ngày/link lớp; Reports cố định12tháng, không bộ chọn kỳ/bảng số liệu theo yêu cầu mới, không khôi phục công nợ/xuất chi tiết.
- [x] 7. Build/lint/typecheck + checks SSR/regression, review, handoff. Không mutation vào DB thật để thử UI.

## Tiêu chí

Dùng token/component Admin, không đổi Modal public/Teacher/Student. State URL cho profile/tab/filter. Mọi API lỗi có hướng thử lại; loading không hiển thị0 giả. Kiểm tra bàn phím/desktop trên browser bằng fixture API; mobile hoãn theo yêu cầu ngày2026-11-06, to-do trong FE-ADMIN.md. Các sửa dùng chung đã có được giữ.

## Mobile — chưa làm tiếp theo yêu cầu
- [ ] Hoàn thiện và nghiệm thu mobile UI/UX ở đợt riêng; danh sách chi tiết trong docs/admin/FE-ADMIN.md. Không tính mobile là hoàn tất cùng desktop.

## Điều chỉnh theo yêu cầu 2026-11-06
Khóa/Phòng chỉ hiển thị Sửa và Xóa trực tiếp; bỏ chi tiết. Báo cáo giữ12tháng, bỏ bảng số liệu và bộ chọn kỳ. Style desktop cần thiết nằm trong AdminApi.css; không khôi phục CSS mobile đã bỏ.
