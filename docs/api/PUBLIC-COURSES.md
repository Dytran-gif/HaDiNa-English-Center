# Đồng bộ khóa học Admin → website — 2026-11-27

## Nguồn dữ liệu

- Public chỉ dùng `GET /api/public/courses`: cùng bảng Courses do Admin quản lý, lọc `IsPublished`. Không sao chép, ghi đè hay tạo lại khóa học. Không migration.
- Tên, mô tả, slug, band, số buổi, buổi/tuần, ảnh, học phí, giảm giá và giá sau giảm đều lấy từ BE. Giá hiển thị theo `final_price` do BE tính; FE không ghi/cập nhật giá.
- Public detail `/khoa-hoc/{slug}` tra slug thật của DB; không còn bắt buộc slug nằm trong danh sách tĩnh. Các slug hiện có trong DB giữ nguyên. Slug không tồn tại/khóa ẩn không dùng nội dung mẫu thay thế.
- Endpoint list/detail trả `Cache-Control: no-store,no-cache`. Link giáo viên trong lớp chỉ trỏ đến hồ sơ public của giáo viên đang dạy, tài khoản không khóa.

## Các nơi dùng chung catalog

- Homepage: 6 khóa đầu theo thứ tự API (tên), kèm liên kết xem tất cả và tổng số khóa.
- `/khoa-hoc`: toàn bộ khóa được công bố, không còn bộ lọc danh mục tĩnh vì Courses hiện không có quan hệ danh mục tương ứng.
- Chi tiết: tên/mô tả/band/số buổi/tần suất/học phí và các lớp đang mở theo ID thật. Không hiển thị syllabus/trình độ/thời lượng tuần tự gán từ dữ liệu cũ.
- Header submenu, footer, form tư vấn và khảo sát đều lấy khóa/slug từ catalog. Khảo sát chỉ gợi ý trong các khóa hiện có, hoặc dẫn về danh sách nếu không tìm được khóa phù hợp.
- `data/courses.ts` giữ nguyên như nội dung cũ chưa sử dụng để tránh xóa mất nguồn; không còn import vào giao diện đang chạy.

## Làm mới và trạng thái

- `usePublicCourses` chia sẻ một request giữa các thành phần; làm mới khi mount đầu tiên, focus, sự kiện trong tab hoặc storage event từ tab khác.
- API Admin thành công khi sửa khóa/lớp/giáo viên/ghi danh và API Student ghi danh/hủy phát thông báo làm mới. Yêu cầu cập nhật đến trong lúc đang tải được xếp tải lại sau request hiện tại.
- API lỗi/rỗng có trạng thái riêng, nút thử lại; không hiện khóa mẫu. Form tư vấn chọn khóa trong API và không gửi khi catalog chưa sẵn sàng hoặc lựa chọn không còn tồn tại.
- Thay đổi từ thiết bị khác được tải lại khi người dùng focus hoặc mở lại trang; không bổ sung websocket/polling.

## Đã xác minh

- DB hiện có 14 khóa, cả 14 được công bố; API public khớp từng ID/tên/slug/band/số buổi/học phí với Admin. Homepage 6, danh sách tất cả 14.
- 46 kiểm tra API/Chrome headless đạt: chi tiết từng slug, menu/footer/tư vấn, khóa mới có slug mới, giá sau giảm, chuyển ẩn, slug sai, lỗi/rỗng/thử lại, gộp request và rê chuột qua menu.
- Khóa QA đã xóa trong finally; so sánh toàn bộ response Admin trước/sau không thay đổi dữ liệu khóa ban đầu. Không đụng lớp/ghi danh/phiếu thu có sẵn.
- FE lint/typecheck/build và BE build đạt; lint còn hai cảnh báo Fast Refresh cũ, Vite còn cảnh báo dung lượng bundle cũ.
