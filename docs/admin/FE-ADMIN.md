# Chạy thử FE Admin với BE

Cập nhật 2026-10-30. Các trang mới dùng API thật; không giả lập lưu thành công khi chưa có BE/DB.

## Chạy giao diện

Tại `app/frontend`:

```powershell
npm.cmd install  # chỉ khi chưa có node_modules
npm.cmd run dev
```

Mở URL Vite in ra (thường http://localhost:5173). Dùng `npm.cmd` nếu PowerShell chặn npm.ps1, không cần đổi ExecutionPolicy.

## Đăng nhập

- Mặc định: email/mật khẩu gửi `POST /api/auth/login`. Token nằm trong session của AuthContext, cùng khóa `ecw_auth_user`; service nhận token từ context, không tạo nơi lưu token thứ hai.
- Chưa có DB: chọn “Xem giao diện bằng tài khoản demo”, đăng nhập admin@demo.com / 123456. Có thể mở menu/form để xem cấu trúc. Danh sách thật sẽ báo cần đăng nhập máy chủ; form cấu hình trung tâm bị khóa cho tới khi tải được dữ liệu. Không hiển thị dữ liệu giả như dữ liệu thật.
- Đăng xuất xóa session; API trả 401 thì kết thúc session. 403/409/validation giữ message để người dùng xử lý. Đổi mật khẩu cập nhật token mới BE trả về vì token cũ bị thu hồi.

## Kết nối máy chủ

Vite development proxy `/api` và `/uploads` tới http://localhost:5220. Không cần thay CORS BE để thử qua Vite. Mặc định để trống VITE_API_URL để request đi cùng origin qua proxy. Nếu đặt VITE_API_URL, giá trị là origin máy chủ, không thêm /api; gọi chéo origin cần CORS từ hạ tầng.

Production không có Vite proxy: cấu hình reverse proxy /api và /uploads hoặc cấp VITE_API_URL trước khi build, kèm CORS phù hợp nếu khác origin. Không đưa mật khẩu/token vào biến môi trường FE.

Từ 2026-10-31, Program.cs mặc định không migrate/seed. Chỉ chạy khối khởi tạo khi Database:InitializeOnStartup=true; giữ false khi thử DB hiện có.

## Trang và API đang dùng

| Trang | Route FE | API |
|---|---|---|
| Giáo viên | /admin/teachers | teachers CRUD/detail/reset-password/lock/unlock; lọc search/status/specialty |
| Học viên | /admin/students | students CRUD/detail/reset-password/lock/unlock; detail có enrollments, payments + totalPaid; ghi danh/rút qua route cũ được BE hỗ trợ |
| Khóa học | /admin/courses | courses CRUD, search và phân trang 16 |
| Lớp học | /admin/classes | classes CRUD/detail, lịch tuần có roomId; lọc courseId/teacherId/status; rút bằng enrollmentId |
| Phòng | /admin/rooms | rooms CRUD, đúng name/capacity; bỏ phân bổ phòng theo khóa mock vì BE gắn phòng trong lịch lớp |
| Học phí | /admin/payments | payments list/search/create/receipt; chọn ghi danh Active chưa có phiếu từ students/{id}; in bằng window.print |
| Cài đặt | /admin/settings | GET/PUT settings/center, POST settings/change-password |
| Đường dẫn cũ | /admin/users | Redirect sang /admin/students |

Dashboard có lối tắt `?action=create` tới thêm HV/tạo lớp/tạo phiếu. Menu/title đã bổ sung, sidebar gồm 5 nhóm, trên màn hình nhỏ mở bằng menu trượt. Nền auth/demo Teacher/Student cũ vẫn dùng được qua lựa chọn demo.

## Những giới hạn còn lại

- Dashboard, Blog và Reports chưa có API: giữ giao diện demo, có thông báo minh họa. Không gọi endpoint chưa tồn tại.
- Email không cho sửa trong form update GV/HV vì DTO BE hiện không nhận email; email có trong tạo và chi tiết.
- Logo chỉ hiển thị, chưa có upload endpoint. BE chưa có họ tên admin: biên lai tạm dùng email; phiếu học phí 0 vẫn bị chặn theo DB-CAN-LAM.md.
- Lọc chuyên môn BE hiện khớp chính xác. API teachers/specialties và GET riêng teachers/{id}/classes chưa có; trang dùng dữ liệu chi tiết BE hiện trả.
- Biên lai không có sửa/xóa phiếu; số tiền chỉ đọc từ snapshot, POST không chứa amount. Chỉ gửi khi admin tích xác nhận đã nhận đủ tiền.
- Dropdown lớp tải toàn bộ trang danh mục khóa/GV hiện có; tìm học viên tạo phiếu giới hạn 100 kết quả và yêu cầu thu hẹp từ khóa nếu nhiều hơn.
- Toàn bộ kiểm thử tích hợp với SQL Server và QA hiển thị trong trình duyệt vẫn cần làm khi DB/công cụ trình duyệt sẵn sàng.

## Kiểm tra đã chạy

`npm.cmd run lint`: PASS (1 warning Fast Refresh đã có trong AuthContext). `npm.cmd run typecheck`: PASS. `npm.cmd run build`: PASS. `node scripts/verify-admin.mjs`: 27/27 PASS (service/error/session/server render, không kết nối DB).

## Cải thiện UI — plan 24, đợt 1
Bộ token/Admin UI foundation đã có dưới pages/admin/Components/Ui, Header hiển thị tên/email/logout, Sidebar SVG thống nhất/5 nhóm/drawer mobile. F3 demo/Khóa học/Cài đặt là đợt tiếp theo, chưa coi đã xử lý thông báo trùng hoặc form dirty. Xem docs/design/DESIGN-SYSTEM.md và ADMIN-FE-TRACKER.md.

## Dashboard/Cài đặt — plan 25
Dashboard dùng QuickActions canh trái, KPI một lớp link tới các trang hiện có và recent courses có badge; số liệu vẫn minh họa. Layout chỉ một Notice demo/minh họa. Settings dùng SectionCard đồng bộ, retry trong thông báo lỗi mạng/server thực; khi demo không phát lỗi đăng nhập đỏ và không cho lưu dữ liệu giả. Giữ API/route/login hiện có. Skip-link clipping khi ẩn, chỉ hiện khi focus để không để lộ viền ở góc.

## Tin tức / Blog — đợt 1 mới (plan26)

Danh sách có ảnh bìa/fallback, title2 dòng, danh mục từ dữ liệu demo cũ, Nháp/Đã đăng, ngày và icon actions; tìm300ms/filter/pagination/confirm/toast. Chưa có API posts/Admin upload trong BE, nên Blog luôn ghi rõ minh họa kể cả đăng nhập thật, không gọi endpoint giả. Yêu cầu BE trong BE-YEU-CAU-FE.md.

Kho demo mới admin_blog_v2 đọc dữ liệu cũ admin_blog khi chưa có bản mới, chỉ ghi v2 khi có thao tác; giữ nguyên backup cũ. Nếu dữ liệu hỏng hoặc không lưu được, báo lỗi thay vì âm thầm thay seed/giả thành công.

Giữ /admin/blog, màn soạn tối giản dùng query compose=new hoặc compose=id, không sửa route/auth. Đợt1 chỉ chuyển form demo văn bản ra khỏi modal để thêm/sửa hoạt động; editor2 cột/contentEditable/ảnh/chưa lưu vẫn đợt2–3. Lưu nháp giữ màn, Published quay lại list; toast nói rõ lưu trình duyệt. Preview hiện là văn bản React escape, không HTML; không thay trang public.

## Cập nhật 2026-10-31 — bỏ Đơn giáo viên
Đã xóa menu/title/route/page/type FE và controller Admin teacher-requests ở BE. Link thông báo mới từ cổng Giáo viên bỏ đích route đã xóa. Entity và các chức năng riêng của cổng Giáo viên được giữ; DB không thay đổi. Trang Admin dùng API còn 7 (Dashboard dùng thêm classes cho bảng theo ngày).

## Cập nhật fullstack 2026-10-31 — plan27

Dashboard KPI/Reports đã dùng API thật `dashboard/kpis` và `dashboard/revenue-by-month?months=12`; không đọc số mẫu/localStorage. Blog còn demo. Đây là cập nhật mới thay các ghi chú minh họa Dashboard/Reports phía trên. Bảng lớp ngày vẫn dùng classes/schedules hiện có. Khi không có token/server, hiện lỗi rõ và số -- thay vì giả số0.

Đã đồng bộ mật khẩu8ký tự, trường lỗi trong form, dropdown band/preview/snapshot và phân trang tự phục hồi URL quá phạm vi. Mock vẫn dùng riêng5174 và banner bản thử; npm run dev5173 gọi BE5220. Không dùng mock để chứng minh kết nối SQL thật. Xem reports/27-fs-admin-review-implementation.md.

## Chạy với EnglishCenterDB thật — đã kiểm tra 2026-10-31

- SQL Server localhost, database EnglishCenterDB, Windows Authentication qua ConnectionStrings:Default hiện có; không cần đổi chuỗi kết nối.
- FE: http://127.0.0.1:5173/dang-nhap ; BE: http://localhost:5220 . Bản mock5174 đã dừng.
- Dùng tài khoản Admin hiện có trong DB. Tài khoản admin@demo.com / 123456 đã đăng nhập API thành công; không chọn checkbox xem demo. Nếu trước đây dùng session demo trên5173, đăng xuất rồi đăng nhập lại bằng máy chủ.

Từ gốc repo, mở hai terminal:

```powershell
# Terminal BE (tài khoản Windows có quyền SQL Server)
cd app/backend/EnglishCenter.Api
dotnet run --project EnglishCenter.Api/EnglishCenter.Api.csproj -- --urls http://localhost:5220 --Database:InitializeOnStartup=false
```

```powershell
# Terminal FE
cd app/frontend
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Đã kiểm tra login/JWT, KPI, revenue, danh sách Khóa/GV/HV/Lớp/Phòng/Payments/Center và các GET chi tiết qua Vite proxy. DB hiện1khóa/1lớp/2GV/2HV/0phiếu; không ghi thêm dữ liệu thử. Các thao tác bạn tự bấm thêm/sửa/xóa trên5173 sẽ dùng DB thật.

Chưa thử mutation hoặc xác nhận toàn TeacherPortal vì DB thiếu các bảng mở rộng; Blog vẫn demo riêng. Không bật khởi tạo DB tự động để xử lý phần schema còn thiếu.