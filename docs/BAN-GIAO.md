# Nhật ký bàn giao
## [2026-10-31] Codex — Gỡ Đơn giáo viên khỏi FE và BE Admin

**Đã xong**
- Theo yêu cầu mới, xóa menu/title/route/page/type FE; xóa TeacherRequestsController gồm GET danh sách, POST approve/reject. Gỡ mock handler và case render trang đã xóa.
- Bỏ link /admin/teacher-requests trong hai thông báo mới phát sinh từ TeacherPortal, giữ nội dung thông báo và logic gửi đơn.
- Cập nhật ADMIN_API, FE-ADMIN, tracker, context và hướng dẫn preview. Quyết định mới thay thế chủ trương giữ BE/hoãn FE trước đây.
- FE build/typecheck PASS; lint 0 error/1 warning AuthContext cũ; verify-admin 26 PASS. BE dotnet build --no-restore PASS 0 warning/0 error. Không chạy DB/migration.

**Đang dở**
- Không còn giao diện/API Admin duyệt các đơn Pending. Luồng gửi và dữ liệu đơn của TeacherPortal vẫn tồn tại, chưa có cơ chế xử lý thay thế.

**Việc tiếp theo**
- Refresh giao diện để kiểm tra nhóm Đào tạo; tiếp tục audit theo lượt khi được yêu cầu.

**Bẫy cần biết**
- Entity/DbSet TeacherRequest còn được TeacherPortal và SessionService dùng: không xóa bảng/migration hay dữ liệu cũ trong đợt gỡ Admin.
- Thông báo cũ đã lưu DB có thể vẫn chứa đường dẫn cũ; không sửa DB. AUDIT-ADMIN ngày 2026-10-30 là ảnh chụp lịch sử trước quyết định này.

## [2026-10-31] Codex — Dashboard lớp học theo ngày

**Đã xong**
- Bỏ Khóa học gần đây, thêm TodayClasses với ngày mặc định giờ Việt Nam và ô chọn ngày. Ba cột: tên lớp, giáo viên, số học viên Active. Dùng API classes hiện có, tải hết trang, lọc lịch theo thứ 1–7 và khoảng ngày lớp; mỗi lớp một hàng, sắp theo giờ đầu tiên.
- Reuse SectionCard/InputField/TableSkeleton/EmptyState/Notice; có lỗi/thử lại, không sửa backend/auth/route/dependency.
- Build/typecheck PASS, lint 0 error/1 warning cũ. Mock kiểm tra 31/10 có3 lớp, 01/11 có0, 02/11 có5. Bản thử: http://127.0.0.1:5174/admin/dashboard .

**Đang dở**
- Chưa thực hiện đầy đủ 1.5 theo spec: chưa endpoint dashboard riêng/giờ/phòng/link chi tiết; không coi bảng ba cột này là hoàn tất audit.

**Việc tiếp theo**
- Mở Dashboard kiểm tra giao diện; tiếp tục audit Page3–5 khi được yêu cầu.

**Bẫy cần biết**
- API dayOfWeek Monday=1, Sunday=7, JavaScript Sunday=0; không lọc chỉ theo thứ mà bỏ ngày bắt đầu/kết thúc lớp.
- Sĩ số là số Active hiện tại, không phải lịch sử điểm danh theo ngày. Giữ thay đổi Payment.cs và các tài liệu audit sẵn có của workspace.

## [2026-10-30] Codex — Audit ADMIN lượt 1/3, Page 1–2

**Đã xong**
- Đối chiếu 13 task FE + BE với ADMIN-SPEC; tạo docs/admin/AUDIT-ADMIN.md, cập nhật hai tracker theo mã spec. Tổng 26 nhãn: ✅2, ⚠️6, ❌11, 🔶6, ⏸0, ❓1; kiểm kê 8 mục dư, không xóa code.
- dotnet build PASS 0 warning/error; FE build PASS, lint 0 error/1 warning AuthContext có sẵn. Không chạy app/DB/migration.

**Đang dở**
- Chưa audit sâu Page3–8. Dashboard thiếu API/khối spec; Courses API có nhưng thiếu field/cấu trúc card/form theo spec.

**Việc tiếp theo**
- Lượt2 đọc AUDIT-ADMIN.md rồi audit Page3,4,5; lượt3 Page6,7,8 và mới tạo KE-HOACH-SUA.md.
- Xin chốt định nghĩa lớp đang mở, sort khóa, ảnh hưởng số buổi tới lớp cũ, cách đếm học viên, giới hạn form và phần dư theo bảng trong báo cáo.

**Bẫy cần biết**
- Total alias đã có; finalTuition tùy chọn. Không báo nhầm thiếu total hay FE đang đọc field khóa không tồn tại.
- Tracker cũ có quyết định chưa thấy xác nhận; audit không tự chốt. FE Đơn giáo viên vẫn có menu/route dù chủ trương hoãn; BE giữ có chủ đích.
- Chỉ bốn tài liệu thay đổi. Không tạo báo cáo review/plans ngoài danh sách đầu ra được cho phép.

## [2026-10-30] Codex — Blog đợt1 danh sách (plan26)

**Đã xong**
- Danh sách Blog mới: cover/fallback, search300ms/filterstatus, Badge/category legacy/date, icon actions, skeleton/empty/pagination; xác nhận xóa nêu tên bài và Toast thành công/lỗi.
- Kho demo v2 đọc admin_blog cũ, giữ backup, không giả lưu khi storage hỏng/đầy. Không có posts/Admin upload controller nên không gọi API giả; 8 yêu cầu BE trong BE-YEU-CAU-FE.md.
- Nút thêm/sửa sang màn compose trên route /admin/blog bằng query; giữ form demo văn bản cũ khỏi modal. Draft giữ compose, Published về list. Preview văn bản React escape, không HTML không sạch.
- Notice Blog một info; action cùng hàng desktop/xuống mobile. Ui props thêm đều optional, không đổi auth/routes/BE/deps.
- Build/lint qua nhóm, 0 lỗi (1 warning AuthContext có sẵn). 16 kiểm tra Blog và55 kiểm tra cũ PASS. Docs/tracker/design/plans cập nhật.

**Đang dở**
- Đúng phạm vi chỉ Việc1+6. Việc2 editor2 cột/toolbar/excerpt/cover/unsaved warning chưa xong; form hiện tại tối giản để giữ thao tác demo. Việc3 ảnh/HTML preview và Việc5 gallery sang đợt3/4.
- API posts/detail/mutations, upload, homepage-images và public chưa có; Category/Excerpt/Slug/ThumbnailAlt chưa thuộc entity hiện tại.
- Chưa có browser tool để ảnh/keyboard/viewport1440/1024/390; không coi SSR là QA tương tác.

**Việc tiếp theo**
1. Blog đợt2: editor 2 cột, title/excerpt theo BE chốt, không chèn hình.
2. Toolbar contentEditable/validate/focus/unsaved warning.
3. Save/load/404/error và trạng thái gửi đầy đủ; khi BE có API thật mới nối, rồi đợt3 ảnh+HTML preview.

**Bẫy cần biết**
- Không thêm Tiptap/DOMPurify lúc này vì convention cấm dependencies. Preview đợt1 là plain text React escape; sanitizer allowlist phải làm/kiểm tra trước HTML đợt3.
- Danh mục legacy chỉ demo, form ẩn, không gửi field giả lên BE. Chưa upload: không dùng endpoint Teacher thay Admin.
- Không reset seed khi storage lỗi; admin_blog_v2 chỉ ghi sau mutation và giữ admin_blog cũ.
- ConfirmDialog onFailure Blog đóng trước rồi toast để không bị native modal che; các callers cũ giữ lỗi inline mặc định.

---
## [2026-10-30] Codex — Dashboard/Cài đặt, plan 25

**Đã xong**
- QuickActions flex trái/gap12/nút40/icon SVG, dưới640 một cột; giữ đúng ba đích action=create. KPI một Link/thẻ, grid4/2/1, không lồng Card/StatBlock. Recent courses một SectionCard, ghost link và Badge neutral.
- Gộp hai banner demo/minh họa thành một Notice info; main padding-top24. Sửa skip-link clipping khi ẩn để tránh lộ viền ở góc, vẫn hiện khi Tab.
- Settings dùng hai SectionCard đồng bộ, heading18/600/gap16, input44/radius10/placeholder, disabled không nhạt cả form; footer cùng đáy, password help/match, dirty save. Retry trong Notice lỗi thực; demo không có lỗi đăng nhập đỏ giả trong Settings.
- Shared composition/style ở Ui/QuickActions, SectionCard, AdminPanels.css; token bổ sung chỉ Admin. Không sửa BE/API/route/auth/services/deps hoặc vùng khác.
- Build/lint qua từng nhóm, 0 lỗi (1 warning AuthContext có sẵn); 28 kiểm tra UI +27 API/session cũ PASS, 12 assertions SSR mục tiêu đạt. Docs/tracker cập nhật.

**Đang dở**
- Không có browser tool nên chưa chụp/đo viewport thực tế. Nguồn skip-link xác định từ code; chưa xác nhận trên ảnh người dùng.
- Việc6 mới có tiêu đề NHỊP, không có nội dung để triển khai. Các bảng/trang khác còn cần EmptyState/thông báo demo trung tính; không đánh F3-A.1 toàn bộ xong.

**Việc tiếp theo**
1. Khóa học mẫu F3-A.2: toolbar/skeleton/badge/icon action/ConfirmDialog.
2. Áp dụng trạng thái demo/rỗng/lỗi và toast mutation cho các bảng/trang còn lại.
3. Khi browser host sẵn sàng: QA tương tác/ảnh ở1440/1024/390, gồm dirty form/password/retry, link/keyboard/skip-link.

**Bẫy cần biết**
- Dashboard còn dữ liệu minh họa, không có API mới. Không sửa Dashboard.css vì Reports còn dùng class cũ; composition mới dùng AdminPanels.css.
- Padding20 KPI và radius10/12 là yêu cầu cụ thể được token hóa; khoảng cách còn lại thang4/8. Nút nhanh40, controls/form44.
- Không xóa skip-link, chỉ ẩn an toàn khi chưa focus. Không đổi route/logic auth để sửa UI.
- PowerShell dùng npm.cmd. Warning Fast Refresh AuthContext vẫn ngoài phạm vi, không suppress.

---
## [2026-10-30] Codex — FE Admin UI, đợt 1 F2 (plan 24)

**Đã xong**
- Tạo token scoped --admin-* trong Components/Ui/AdminTokens.css; primary xanh/disabled xám/danger đúng ngữ cảnh. Adapter Button/FormField/Tag nền, không đổi token hoặc UI Public/Teacher/Student.
- Bộ SVG thống nhất; Button 4 biến thể/loading/icon; FormField help/error/aria/hiện-ẩn mật khẩu; Notice, EmptyState, TableSkeleton, Badge, Pagination, ToastProvider và ConfirmDialog/native Dialog.
- Các page Admin đổi import Button/FormField sang adapter (không đổi API/validation nghiệp vụ). Feedback/Pager tái dùng Notice/Pagination; toast foundation chưa gắn mọi mutation.
- Sidebar chia 5 nhóm, drawer mobile, focus/Escape/native dialog; header tên/email/logout từ context cũ; không sửa auth/routes/BE.
- Build/lint qua từng nhóm, không lỗi; lint giữ 1 warning Fast Refresh AuthContext có sẵn. 28 kiểm tra UI SSR/contrast và 27 kiểm tra API/session/render cũ PASS.
- Tạo ADMIN-FE-TRACKER, DESIGN-SYSTEM; sửa tài liệu hiện trạng API/demo, token/đường dẫn. Tài liệu đồ án cũ thêm nhãn lịch sử, không viết lại lịch sử bàn giao.

**Đang dở**
- Đúng phạm vi: lần này chỉ đợt 1. Thông báo demo bị trùng, mẫu Khóa học, form Cài đặt thuộc đợt 2; chưa đánh xong.
- Không có ảnh trước/sau: cua_repl báo native pipe và browser access host unavailable. Chưa QA hình ảnh/keyboard ở 1440/1024/390.

**Việc tiếp theo**
1. F3-A.1: gom demo/chưa token thành một info + nút đăng nhập, EmptyState trung tính; lỗi mạng/server thật có thử lại.
2. F3-A.2: mẫu Khóa học với toolbar/search/skeleton/badge/icon action/ConfirmDialog/409.
3. F3-A.3: Cài đặt có dirty form, nhãn/khoảng cách, match mật khẩu khi gõ, ghi chú logo.

**Bẫy cần biết**
- Không sửa backend/API/auth/route, không thêm thư viện. Token UI ở Admin, không đổi global Button đang dùng đỏ ở vùng khác.
- ConfirmDialog onConfirm phải reject khi server lỗi, không nuốt lỗi rồi đóng. Đợt 2/3 mới thay các window.confirm và gắn toast mutation.
- Native dialog giữ trong DOM Admin để kế thừa token; menu tự đóng khi chọn route hoặc về viewport desktop. Hạ tầng chưa có DB thì chỉ kiểm tra FE, không khởi động BE auto migrate/seed.
- Một warning AuthContext ngoài phạm vi không được suppress hoặc sửa auth để làm số warning bằng 0.

**Cần người khác làm / chờ**
- F3-B Public thuộc Hoàng theo ownership, ghi cả 6 đề xuất ⏸ trong ADMIN-FE-TRACKER; không sửa trang chủ.
- Cần browser host để chụp trước/sau và QA tương tác; cần DB cho E2E nghiệp vụ sau.

---
## [2026-10-30] Codex — FE Admin theo API hiện có (plan 23)

**Đã xong**
- Thêm Giáo viên, Học viên, Lớp học, Đơn giáo viên, Cài đặt; menu/title/route tương ứng. /admin/users redirect sang Students.
- Nối API thật cho Khóa học/Phòng/Học phí, CRUD/reset/lock, lịch tuần lớp, ghi danh/rút, duyệt đơn, biên lai và in, cấu hình trung tâm/đổi mật khẩu cập nhật token.
- AuthContext thêm loginApi và token trong session hiện có, giữ đăng nhập demo; Login mặc định gọi BE, checkbox demo khi chưa có DB. Vite proxy /api và /uploads chỉ môi trường dev, không sửa CORS BE.
- Dashboard có 3 lối tắt action=create; Dashboard/Blog/Reports vẫn minh họa và có nhãn. CSS Admin hỗ trợ sidebar mobile và bảng cuộn.
- Sửa tối thiểu 6 lỗi typecheck baseline (import/export/type path). Lint PASS (1 warning baseline), typecheck/build PASS. Script scripts/verify-admin.mjs: 27/27 PASS.
- Hướng dẫn chạy và giới hạn trong docs/admin/FE-ADMIN.md; implementation/review reports plan 23.

**Đang dở**
- Chưa kiểm thử trình duyệt thật: native pipe/browser host của cua_repl không kết nối được. Chưa E2E SQL Server do DB chưa sẵn sàng; không khởi động BE để tránh auto migration/seed.
- Dashboard/Blog/Reports thật chờ BE; email update/logo upload chưa có API nên không làm thao tác giả.

**Việc tiếp theo**
- Khi DB sẵn sàng: npm.cmd run dev tại app/frontend, đăng nhập thật và thử CRUD, 409, token hết hạn, đổi mật khẩu, ghi danh/thu tiền/in.
- BE đợt 2 tiếp tục plan 22. Khi có API Dashboard/Blog/Reports thì nối phần FE còn lại.

**Bẫy cần biết**
- Dùng npm.cmd nếu PowerShell chặn npm.ps1. Tài khoản demo admin@demo.com / 123456 chỉ mở UI, không có token API nên không tải/lưu dữ liệu thật.
- Production cần reverse proxy /api, /uploads hoặc VITE_API_URL + CORS; Vite proxy không đi vào bản build.
- Token đổi mật khẩu được BE cấp lại; không dùng token cũ. Email update ở GV/HV vẫn không được BE nhận.
- Phòng gắn lịch lớp; đã bỏ phân bổ phòng theo khóa mock khỏi trang Rooms.

**Cần người khác làm / chờ**
- Chuẩn bị DB theo docs/admin/DB-CAN-LAM.md; không tự tạo/sửa migration trong đợt FE.
- Người giữ auth/Student lưu ý thay đổi chung trong plan 23; bốn file Student chỉ sửa import, không đổi nghiệp vụ.

---
## [2026-10-30] Codex — Admin, đợt 1 học phí (plan 20)

**Đã xong**
- Tạo tracker đối chiếu đủ 56 task của ADMIN-SPEC; không sửa spec người dùng đã cung cấp.
- GET payments + tìm tên/mã không dấu, POST thu đủ bằng giá snapshot, GET biên lai; GET students/{id}/payments + totalPaid; GET classes/available + giá.
- Thêm Total alias vào PagedResult, giữ field cũ. API doc và EnglishCenter.Api.http khớp endpoint mới.
- Build sau từng task và cuối đợt: 0 warning, 0 error. 24 kiểm tra console tạm PASS, có EF ToQueryString; không khởi động API/kết nối DB. Tự review ghi reports/20-be-admin-hoc-phi-review.md.

**Đang dở**
- 6.3.1 ⏸ phần phiếu học phí 0: DB constraint Amount > 0; thu dương đã có code.
- 6.4.1 ⏸ phần họ tên admin: User chưa có trường tên; createdByName tạm bằng email, doc nói rõ.
- 4.5.1: classes/available đã xong; route ghi danh chuẩn chưa thêm. B3 khác giữ trong tracker để đợt 5 xử lý.

**Việc tiếp theo**
1. Plan 22: GET dashboard/kpis (Studying, Upcoming+Ongoing, doanh thu PaidDate trong tháng).
2. Plan 22: revenue-by-month và new-students-by-month, đủ số tháng liên tục và điền 0.
3. Plan 22: today-classes theo ClassSchedule DayOfWeek 1–7 và almost-full-classes.

**Bẫy cần biết**
- Không tạo/sửa migration hoặc Entities/model; không chạy dotnet ef database update hay API.
- NuGet.Config ngoài sandbox làm build thường bị từ chối; build được cấp quyền ngoài sandbox đã xanh.
- Không có project test nên chưa chạy dotnet test. ToQueryString không kiểm chứng thực thi SQL hoặc race trên DB.
- AppTime dùng giờ máy chủ, cần cấu hình giờ Việt Nam. Validation DTO vẫn ProblemDetails (B3.f đợt 5).
- Form thu tiền dùng ghi danh của HV chưa thu; classes/available dành cho ghi danh mới. Không POST amount, không PUT/DELETE phiếu.

**Cần người khác làm / chờ**
- Người phụ trách DB chốt phiếu miễn phí và bổ sung tên người lập theo docs/admin/DB-CAN-LAM.md; chuẩn bị SQL Server để kiểm thử 401/403, duplicate đồng thời và tìm tên không dấu.
- Nhóm Teacher lưu ý PagedResult chỉ bổ sung total, vẫn giữ totalItems/totalPages.

---

**Đầu buổi:** đọc khối mới nhất, rồi bảng trạng thái trong `plans/README.md`.
**Cuối buổi:** chạy `/handoff` (hoặc tự viết theo mẫu dưới). Khối **mới nhất ở trên cùng**.

Lịch sử bàn giao cũ (giai đoạn chỉ có FE, 08/2026): `docs/do-an/5-Tong-quan-tien-do.md`.

---

## [2026-10-29] Dựng lại cấu trúc repo — Chung

**Đã xong**
- Gộp FE (`english-center-website`) và BE (`english-center-backend`) vào một repo: `app/frontend/`, `app/backend/`.
- Thêm lớp harness `.claude/` (context, skills `/plan` `/implement` `/validate` `/review` `/handoff`, agent `code-reviewer`, hooks).
- Gom tài liệu: `docs/api/` (hợp đồng API), `docs/conventions/`, `docs/do-an/` (báo cáo đồ án). Dữ liệu JSON cũ chuyển sang `docs/do-an/du-lieu-cu/`.
- Viết `docs/api/ADMIN_API.md` (tổng hợp từ code), spec `STUDENT_API.md`, `PUBLIC_API.md`.
- Lập backlog `plans/00`–`91`.
- **Không sửa logic code** FE hay BE. Chỉ di chuyển thư mục, thêm tài liệu và file README giữ chỗ.

**Việc tiếp theo** (theo thứ tự)
- `00` Duy: tạo + commit migration `TeacherFeatures` (chưa có thì API không chạy được).
- `02` Nam: sửa 6 lỗi typecheck ở `student/Course` (đang chặn hook Stop).
- `01` cả nhóm chốt cách nối API (CORS + `apiClient` bằng `fetch`).
- Điền người giữ vùng **Admin** trong `.claude/context/ownership.md` và `plans/README.md`.

**Bẫy cần biết**
- Backend chưa bật CORS. Đăng nhập FE vẫn là mock.
- Lỗi validate DTO trả ProblemDetails `{ errors }`, không phải `{ message }`.
- Hook trong `.claude/settings.json` viết cho **Windows** (`%CLAUDE_PROJECT_DIR%`). Máy macOS/Linux xem `.claude/settings.macos-linux.json`.

---

## Mẫu

```markdown
## [yyyy-mm-dd] <Tên> — <Vùng>

**Đã xong**
- ...

**Đang dở**
- ...

**Việc tiếp theo**
- ...

**Bẫy cần biết**
- ...

**Cần người khác làm / chờ**
- ...
```
