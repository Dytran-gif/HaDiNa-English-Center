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

## Dashboard/Cài đặt — chỉnh nhịp 2026-10-30 (plan 25)

- QuickActions dùng chung: flex canh trái, gap/row-gap12, nút40px/padding ngang16/font14-600/icon plus20 cùng bộ SVG; nhãn13, margin-bottom24. Dưới640px thành một cột đầy chiều rộng.
- KPI dashboard dùng một Link làm thẻ, không Card/StatBlock lồng nhau; padding20 theo yêu cầu cụ thể, radius16/shadow1, icon40/radius12; giá trị32/700. Grid4 cột từ1200px,2 từ640px,1 phía dưới; gap16 và cách recent24. Không thay số liệu minh họa hoặc route đích.
- SectionCard dùng chung cho recent và settings: padding24, heading18/600/màu chữ chính, header→body16, body flex để canh footer. Recent có ghost/link Xem tất cả, row min48, badge neutral, divider trừ hàng cuối.
- Layout chỉ render một Notice info cho demo/minh họa; vẫn có nút đăng nhập khi không token. Padding-top của main24 ở mọi breakpoint.
- Phần góc trái phù hợp nguồn skip-link fixed có border/radius, trước chỉ ẩn transform. Nay clip/overflow/1px khi không focus; chỉ phục hồi đầy đủ khi focus. Chưa có browser để xác nhận hình ảnh của phần tử người dùng thấy.
- Token bổ sung cho yêu cầu cụ thể: font-caption13, font-section18, font-stat32, radius-input10, radius-icon12; không thay chuẩn control44 hay token của vùng khác.

### Cài đặt chung — plan 25

Hai SectionCard dùng heading18/600, gap header→body16, grid align stretch; body/fieldset/form flex cho footer submit nằm cùng đáy. Controls44px, radius10, label14/600, placeholder và disabled xám không giảm opacity cả form. Logo chỉ preview nếu có URL, giữ ghi chú chưa upload.

Chưa có token: chỉ Notice demo của layout, không thêm lỗi đăng nhập đỏ trong Cài đặt; form bị khóa. Có token và lỗi tải thực: Notice error chứa message và nút Thử lại bên trong, cách nội dung12px. Các lỗi thao tác vẫn hiển thị message thật. Thông tin trung tâm chỉ bật lưu khi dirty; mật khẩu có help, match khi gõ/khác mật khẩu cũ và nút hiện/ẩn từ FormField. Endpoint, payload, token trả về và replaceToken giữ nguyên.

## Blog — danh sách và soạn bài theo từng đợt

Đợt1 (plan26) nâng cấp danh sách, kho demo v2 giữ dữ liệu cũ admin_blog, không gọi API chưa có. Model demo chuyển field cũ sang id/title/content/thumbnailUrl/status/publishedAt; legacyCategory chỉ hiển thị dữ liệu mock cũ, không gửi lên BE. Backend Post không có category/slug/excerpt; card danh mục trong soạn sẽ ẩn tới khi có hợp đồng.

Không thêm thư viện vì quy ước cấm cài package. Đợt2 dự kiến contentEditable tối giản; đợt3 cần sanitizer allowlist p,h2,h3,ul,ol,li,strong,em,a,img,blockquote,br trước render HTML. Đợt1 chỉ preview văn bản qua React p (escape HTML), không dangerouslySetInnerHTML, không tự coi đã có preview HTML.

Upload ảnh sẽ áp dụng jpg/png/webp≤5MB, cần endpoint Admin thực và URL trả về. Không dùng endpoint Teacher. Chưa upload: ảnh blob chỉ minh họa và không cho đăng bài chứa blob. Tiến trình/error/clipboard/drop, alt và bố cục ảnh ở đợt3, gallery/order ở đợt4. Xem BE-YEU-CAU-FE.md.

### Danh sách Blog — đợt 1 hoàn tất

`AdminContent.css` trong Ui là style dùng chung cho toolbar/filter/table/content actions. Thumbnail56x40/radius8 (SVG fallback cục bộ), title2 dòng, status Badge xanh/xám, ngày dd/MM/yyyy; Draft hiện —. Pagination có optional itemLabel (mặc định bản ghi), Blog dùng bài viết. SearchField thêm placeholder tương thích cũ, vẫn debounce300ms.

`Notice.inlineAction` đặt action cạnh nội dung trên desktop, xuống dòng dưới48em; Layout chỉ bật cho Blog để tránh đổi các trang khác. ConfirmDialog thêm optional onFailure; Blog đóng dialog lỗi và phát một Toast để không trùng thông báo/không bị native dialog che toast; mặc định inline error của callers cũ giữ nguyên.

Form demo cũ được giữ dưới màn compose riêng bằng query /admin/blog?compose=new hoặc compose=id, không thay route. Chỉ có title/nội dung văn bản/Lưu nháp/Đăng bài để list actions dùng được, chưa phải editor đợt2. Đợt2 mới có contentEditable, excerpt/cover/unsaved warning/skeleton404 chuẩn; field BE thiếu không tự gửi.
