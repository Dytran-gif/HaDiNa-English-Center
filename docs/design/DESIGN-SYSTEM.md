# Design system — Admin HaDiNa

Cập nhật: 2026-10-30, đợt 1 (F2). Chỉ CSS thuần, không thêm thư viện. Nguồn token duy nhất của Admin: `src/pages/admin/Components/Ui/AdminTokens.css`, selector `.admin-layout`. Root token và Public/Teacher/Student không đổi.

## Token

| Nhóm | Token | Giá trị / quy tắc |
|---|---|---|
| Brand | --admin-primary, --admin-primary-hover | #2563eb, #1d4ed8, cùng màu xanh Hadi/menu |
| Info | --admin-primary-soft, --admin-primary-ink | #eff6ff, #1e40af |
| Danger | --admin-danger, --admin-danger-hover, --admin-danger-soft | #b42318, #912018, #fef3f2; chỉ lỗi/xóa |
| Success | --admin-success, --admin-success-soft | #167044, #edfdf5 |
| Warning | --admin-warning, --admin-warning-soft | #854d0e, #fffbeb |
| Neutral | --admin-text, --admin-muted, --admin-surface, --admin-canvas, --admin-border | #172033, #526075, #fff, #f7f9fc, #dce3ed |
| Disabled | --admin-disabled-bg, --admin-disabled-text | #e8edf3, #536176; không hồng, không chỉ giảm opacity |
| Spacing | --admin-space-1/2/3/4/5/6/8/10/12/16 | 4/8/12/16/20/24/32/40/48/64px |
| Radius | --admin-radius-control/panel | 8px/16px |
| Shadow | --admin-shadow-1/2 | nhẹ cho card; cấp 2 cho dialog/drawer |
| Type | --admin-font-xs/sm/md/lg/xl/2xl | .75/.875/1/1.25/1.5/1.75rem; line-height 1.5 |
| Control | --admin-control-height, --admin-icon-size | 44px, 20px; icon SVG viewBox 24/stroke 1.8 |

Các alias --blue/--red/--ink… chỉ tồn tại bên trong Admin để tái dùng component nền. Không dùng primary đỏ dù Button global đang dùng màu đỏ. Focus luôn có outline xanh và offset, không chỉ đổi màu nền.

## Thành phần đợt 1 — đã triển khai và kiểm tra build/SSR

`pages/admin/Components/Ui/Button.tsx` là adapter của Button nền, hỗ trợ primary/secondary (`outline` tương thích)/danger/ghost, loading, icon. IconButton bắt buộc label, tự thêm aria-label/title; không dùng SVG như tên nút. Link disabled được render thành button disabled để không tiếp tục điều hướng.

`FormField.tsx` tái dùng Input/Select/Textarea nền, thêm id tự sinh, error/help nối aria-describedby, disabled/loading, nút hiện/ẩn cho type=password. Không thay giá trị/state/validation nghiệp vụ của form. Nhãn đậm cùng kiểu, placeholder màu phụ, lỗi dưới ô. Placeholder không thay nhãn.

`Notice.tsx` hỗ trợ info/success/warning/error/neutral, title, nội dung và action. Error dùng alert, loại còn lại status. Cùng tình huống chỉ hiển thị một thông báo; không đồng thời toast và Notice lỗi giống hệt. Foundation không tự loại bỏ lỗi demo ở các page (đợt 2).

EmptyState/Skeleton/Toast/Confirm/Badge/Pagination và Sidebar/Header đã triển khai; API dùng lại nằm ở các mục bên dưới. Tích hợp vào từng luồng/page và QA trình duyệt thuộc đợt sau.

## Trạng thái và dữ liệu

- Loading: giữ cấu trúc, skeleton + thông báo cho công nghệ hỗ trợ; không giả số 0 như đã tải.
- Rỗng: icon trung tính, giải thích và action phù hợp; không dùng màu lỗi.
- Lỗi mạng/server: message backend/ApiError, một notice error với nút thử lại cách nội dung ít nhất 12px.
- Demo/chưa có token: một info + nút đăng nhập, empty trung tính. Việc áp dụng trang ở đợt 2; đợt 1 chỉ cung cấp nền.
- Thành công: toast/status; khóa nút khi gửi. Gắn vào từng mutation ở đợt 3.

Tiền qua `Components/Api/adminFormat.ts`: Intl.NumberFormat vi-VN/VND. Ngày DateOnly đảo phần yyyy-MM-dd sang dd/MM/yyyy, không đổi UTC; giao thức API không thay.

## EmptyState, loading, phản hồi và điều hướng

- `EmptyState`: title, description, icon (mặc định empty), action ReactNode. Trong bảng, đặt trong td có colSpan; không đặt div trực tiếp dưới tbody.
- `TableSkeleton`: columns, rows (mặc định 5); trả các tr để đặt trong tbody. Có một thông báo trạng thái, phần trang trí aria-hidden; tôn trọng reduced-motion.
- `Badge`: status API hoặc tone rõ ràng; nhãn tiếng Việt, không chỉ phân biệt bằng màu. Adapter của Tag sẵn có.
- `Pagination`: page/total/pageSize/loading/onChange; “Trang x/y · N bản ghi”, nút xám và khóa ở biên/khi tải. Pager đang dùng đã tái sử dụng component này.
- `ToastProvider` chỉ bọc nội dung Admin. `useToast().notify({title, description?, tone?, key?, duration?})`; tối đa 3 thông báo, gộp cùng key (mặc định tone/title), dừng bộ hẹn giờ khi hover/focus. Mặc định 5 giây, lỗi 8 giây; duration=0 giữ tới khi đóng. Không thêm Notice trùng cùng sự kiện.
- `Dialog` dùng dialog/showModal của trình duyệt, giữ focus bên trong, Escape và khôi phục focus khi đóng. Giữ DOM trong .admin-layout để kế thừa token.
- `ConfirmDialog`: open/title/confirmLabel/danger/onConfirm/onClose và children. Nút Hủy nhận focus ban đầu; pending khóa xác nhận/đóng và chặn gửi hai lần. Nếu onConfirm bị reject, hiển thị đúng message trong hộp và giữ mở; không nuốt lỗi trong callback. Chuyển các window.confirm sang đây ở đợt 2/3.
## Sidebar và Header

Sidebar gồm 5 nhóm: Tổng quan (Dashboard/Báo cáo), Đào tạo (Khóa/Lớp/GV/HV/Đơn), Nội dung (Blog), Tài chính (Học phí), Hệ thống (Phòng/Cài đặt). Một bộ SVG tại Icon.tsx, không dùng emoji/trộn icon. Route và NavLink giữ nguyên; active có nền xanh, chữ đậm và vạch bên cạnh.

Header hiển thị tên/email từ AuthContext hiện có và nút Đăng xuất gọi logout nguyên trạng. Nếu BE chỉ có email thì không bịa tên thật. Mobile vẫn thấy tên/email và Đăng xuất.

Dưới 48em, sidebar desktop ẩn và nút menu mở dialog dạng drawer: background inert, focus trong dialog, Escape/đóng/chọn route sẽ đóng menu, focus trở về nút mở. Desktop 48–64em dùng sidebar 240px, lớn hơn dùng 264px. Header mobile không sticky để tránh chiếm/chồng nội dung; desktop sticky riêng trong Admin. Đây là CSS theo breakpoint; xác minh ảnh 1440/1024/390 thuộc đợt 4 khi trình duyệt có sẵn.

## Xác minh và giới hạn
Build + lint 0 lỗi (1 warning AuthContext có sẵn, không sửa auth). verify-ui.mjs: 28 kiểm tra SSR/semantic/token contrast; verify-admin.mjs: 27 kiểm tra API/session/render cũ vẫn PASS. Các cặp chữ phụ/surface, chữ phụ/canvas, trắng/primary, danger/error-soft, success/soft, warning/soft, disabled/gray đạt ít nhất 4.5:1 theo công thức sRGB. Đây không thay thế đo layout/contrast thực tế trong trình duyệt.

Native pipe/browser host không kết nối được nên chưa có ảnh trước/sau hoặc kiểm tra keyboard thật/viewport 1440, 1024, 390. Không đánh F3-A.6 hoàn tất. Foundation Confirm/Drawer dùng native dialog; khi mở khóa cuộn body và trả style khi đóng; drawer tự đóng khi chuyển viewport sang desktop.
