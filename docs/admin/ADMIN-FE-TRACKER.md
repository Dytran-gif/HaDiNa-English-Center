# ADMIN FE TRACKER

Cập nhật lần cuối: 2026-10-30 — audit lượt 1/3 (Page 1–2)

Đợt tiếp theo: Blog đợt 2 — trình soạn đầy đủ, chưa chèn hình; các việc Admin khác giữ trạng thái riêng.

⬜ chưa làm · 🔵 đang làm · ✅ xong (build + lint 0 lỗi, docs cập nhật) · ⚠️ một phần · ⏸ bị chặn.

Code đã xác minh có đủ 11 trang menu, trong đó 8 trang dùng API và Dashboard/Blog/Reports còn dữ liệu minh họa. /admin/users redirect sang /admin/students. Baseline build PASS, lint 0 lỗi/1 warning AuthContext ngoài phạm vi.

| Mã | Hạng mục | Trạng thái | File đã sửa | Ghi chú |
|---|---|---|---|---|
| F2.tokens | Token Admin | ✅ | Components/Ui/AdminTokens.css | Scoped; không đổi root/Public/Teacher. |
| F2.icons | Một bộ SVG | ✅ | Components/Ui/Icon.tsx | Không thêm thư viện. |
| F2.button | Button | ✅ | Components/Ui/Button.tsx | Adapter nền: primary/secondary/danger/ghost, loading/disabled/focus. |
| F2.field | FormField/password | ✅ | Components/Ui/FormField.tsx | Tái dùng nền; help/error/aria, nhãn, hiện/ẩn mật khẩu; không đổi validate nghiệp vụ. |
| F2.notice | Banner/Notice | ✅ | Components/Ui/Notice.tsx | info/success/warning/error; adapter Feedback. |
| F2.empty | EmptyState | ✅ | Components/Ui/EmptyState.tsx | Icon, giải thích, action. |
| F2.skeleton | TableSkeleton | ✅ | Components/Ui/TableSkeleton.tsx | Loading có aria. |
| F2.toast | Toast | ✅ | Components/Ui/ToastProvider.tsx | Foundation; gắn từng mutation ở đợt 3. |
| F2.confirm | ConfirmDialog | ✅ | Components/Ui/ConfirmDialog.tsx | Native dialog, focus trap, pending, lỗi server. |
| F2.badge | Badge | ✅ | Components/Ui/Badge.tsx | Tone + chữ trạng thái. |
| F2.pagination | Pagination | ✅ | Components/Ui/Pagination.tsx | Trang x/y · N bản ghi; disabled xám. |
| F2.sidebar | Sidebar | ✅ | Components/Sidebar | 5 nhóm/SVG/drawer mobile; chưa QA ảnh thật. |
| F2.header | Header | ✅ | Components/Header | Tên/email/logout từ context cũ; không đổi auth. |
| F3-A.1 | Demo/chưa có token | ⚠️ | AdminLayout, Settings | Đã gộp 2 banner layout thành một Notice; Settings không có lỗi đăng nhập giả. Bảng/trang khác còn cần EmptyState trung tính. |
| F3-A.2 | Khóa học mẫu | ⬜ | Courses, ResourcePage | Tìm kiếm đã debounce; còn skeleton, badge, icon action/confirm. |
| F3-A.3 | Cài đặt chung | ✅ | Settings, SectionCard, AdminPanels.css | Retry trong Notice lỗi thật, tiêu đề/nhãn/input đồng bộ, footer cùng đáy, dirty form, match khi gõ/help; build/lint/doc khớp. |
| F3-A.4.teachers | Giáo viên | ⬜ | Teachers, ResourcePage | Đợt 3 áp dụng mẫu. |
| F3-A.4.students | Học viên | ⬜ | Students, ResourcePage | Đợt 3. |
| F3-A.4.classes | Lớp học | ⬜ | Classes | Đợt 3. |
| F3-A.4.rooms | Phòng học | ⬜ | Rooms, ResourcePage | Đợt 3. |
| F3-A.4.payments | Học phí | ⬜ | Payments | Đợt 3; chưa thay nghiệp vụ. |
| F3-A.4.blog | Tin tức/Blog | ⚠️ | Blog, Ui/AdminContent.css | Danh sách demo mới đã xong; editor/image/gallery và API còn thiếu, xem nhóm BLOG bên dưới. |
| F3-A.4.requests | Đơn giáo viên | ⬜ | TeacherRequests | Đợt 3. |
| F3-A.4.reports | Báo cáo | ⬜ | Reports | Đợt 3; dữ liệu minh họa. |
| F3-A.4.dashboard | Dashboard | ⚠️ | Dashboard, StatsOverview, QuickActions, SectionCard, AdminPanels.css | Quick actions/KPI đơn/recent đã xong; chart/lớp hôm nay/sắp đầy chưa làm, vẫn dữ liệu minh họa có nhãn. |
| F3-A.5 | Toast cho từng mutation | ⬜ | Các trang Admin | Đợt 3; foundation không tính đã tích hợp mọi thao tác. |
| F3-A.6 | Responsive/accessibility | ⬜ | Admin | Đợt 4 QA 1440/1024/390, focus/contrast/screen reader. |
| F3-B.1 | Bốn ô môi trường học tập | ⏸ | components/sections/AboutTeaser.tsx | Ownership Public thuộc Hoàng; đề xuất tiêu đề/mô tả/icon 01–04. |
| F3-B.2 | Đánh giá/overflow/sticky | ⏸ | sections/Testimonials, ui/TestimonialCard, layout/Header | Chờ chủ vùng kiểm tra cắt sao/thẻ và z-index. |
| F3-B.3 | Minh họa chương trình | ⏸ | sections/Hero, CourseShowcase; ui/CertificateMock | Chờ chủ vùng thay mockup chữ, tránh cắt CAMB. |
| F3-B.4 | Ảnh bìa tin tức | ⏸ | sections/NewsBlog, ui/BlogCard | Chờ chủ vùng thêm cover/fallback. |
| F3-B.5 | Thương hiệu/liên hệ | ⏸ | layout/Header/Footer, sections/Hero/RegisterCta | Chờ chủ vùng chốt tên, lấy API hoặc một file hằng số. |
| F3-B.6 | Trắc nghiệm/tư vấn | ⏸ | sections/CourseSurvey, RegisterCta | Chờ chủ vùng sửa độ rộng, placeholder và form states. |
| F4.design | DESIGN-SYSTEM | ✅ | docs/design/DESIGN-SYSTEM.md | Đã cập nhật sau từng nhóm; token/component/state và phạm vi áp dụng. |
| F4.conventions | Quy ước frontend | ✅ | docs/conventions/FRONTEND.md | Đã cập nhật component/state và API thật/demo. |
| F4.context | Context frontend | ✅ | .claude/context/frontend.md | Đã cập nhật đường dẫn, API thật/demo và script QA. |
| F4.current-docs | Tài liệu hiện trạng | ✅ | CLAUDE, FE-ADMIN, TECH-STACK, context auth/api | Không sửa lịch sử như hiện trạng; báo cáo đồ án cũ phải ghi rõ thời điểm. |
| F4.handoff | Bàn giao | ✅ | docs/BAN-GIAO.md | Khối mới đầu file. |
| F4.plans | Bảng plans | ✅ | plans/README.md | Thêm plan 24 và chỉ đánh xong đợt 1. |

## Tinh chỉnh theo yêu cầu mới — plan 25

| Mã | Hạng mục | Trạng thái | File đã sửa | Ghi chú |
|---|---|---|---|---|
| P25.1 | Thao tác nhanh | ✅ | QuickActions, Dashboard, AdminPanels.css | Canh trái/gap12/nút40/icon SVG; dưới640 một cột; link giữ nguyên. |
| P25.2.notice | Thông báo demo | ✅ | AdminLayout, Notice hiện có | Một info, action đăng nhập; main padding-top24 mọi breakpoint. |
| P25.2.skip | Viền góc trên trái | ✅ | AdminLayout.css | Nguồn code phù hợp là skip-link fixed có border/radius, trước chỉ ẩn transform; đổi clipping khi không focus, vẫn hiện khi Tab. Chưa có browser xác nhận ảnh. |
| P25.3 | Thẻ KPI | ✅ | StatsOverview, AdminPanels.css | Một Link/thẻ, không StatBlock bọc Card; grid4/2/1 theo1200/640, gap16. |
| P25.4 | Khóa học gần đây | ✅ | Dashboard, SectionCard, Badge, AdminPanels.css | Một card, ghost link, row≥48/divider/hover/badge neutral. |
| P25.5 | Cài đặt | ✅ | Settings, SectionCard, AdminPanels.css | Hai thẻ stretch, input44/radius10/placeholder, help/password, footer cân bằng; API/auth giữ nguyên. |

## Blog mới — plan 26, từng đợt theo yêu cầu

| Mã | Hạng mục | Trạng thái | File đã sửa | Ghi chú |
|---|---|---|---|---|
| BLOG.1.toolbar | Tiêu đề/số lượng/tìm/lọc | ✅ | BlogManagement, SearchField, AdminContent.css | Search300ms có icon/placeholder; status kết hợp trang; local demo. |
| BLOG.1.table | Bảng bài viết | ✅ | BlogManagement, AdminContent.css, placeholder.svg | Cover56x40/fallback, title2 dòng, category legacy demo, Badge/status, dd/MM/yyyy và Draft —, icon có label/tooltip. |
| BLOG.1.paging | Pagination/skeleton/empty | ✅ | BlogManagement, Pagination | Trang x/y · N bài viết, loading/disabled, empty khác nhau khi lọc hoặc chưa có bài. |
| BLOG.1.delete | Xóa/confirm/toast | ✅ | demoPosts, BlogManagement, ConfirmDialog | Nêu tên bài, thành công/lỗi Toast, lỗi lưu không giả thành công/không mất dữ liệu. |
| BLOG.1.entry | Nút thêm/sửa sang màn riêng | ✅ | DemoPostEntry, query compose trên /admin/blog | Giữ form demo văn bản cũ để không làm mất thao tác, không modal; editor đầy đủ đợt2. |
| BLOG.1.notice | Notice demo gọn | ✅ | Notice, AdminUi.css, AdminLayout | Một Notice; action cùng hàng desktop, xuống hàng mobile. |
| BLOG.1.api | API posts thật | ⏸ | BE-YEU-CAU-FE | Chưa có controller; không gọi endpoint giả dù đăng nhập thật. |
| BLOG.2.layout | Editor2 cột≥1024 | ⬜ | Chưa làm | Đợt2, không coi form văn bản tối giản là editor mới. |
| BLOG.2.fields | Title/excerpt/counter | ⚠️ | DemoPostEntry | Title250/counter có; excerpt chưa có trong entity, cần BE chốt. |
| BLOG.2.toolbar | Toolbar/rich text/sticky | ⬜ | Chưa làm | Dự kiến contentEditable vì không thêm thư viện. |
| BLOG.2.publish | Thẻ đăng bài/status/date | ⚠️ | DemoPostEntry | Demo có draft/publish, draft giữ màn/Published về list; UI2 cột/settings còn đợt2. |
| BLOG.2.cover | Cover/drop/alt/5MB | ⬜ | Chưa làm | Đợt2; upload thật chờ BE. |
| BLOG.2.category | Danh mục trong form | ⏸ | BE-YEU-CAU-FE | Post không có category, không hiện form danh mục/không gửi field giả; bảng giữ legacy mock. |
| BLOG.2.validation | Validate/focus | ⚠️ | DemoPostEntry | Basic title/content có; hoàn thiện editor đợt2. |
| BLOG.2.unsaved | Cảnh báo chưa lưu | ⬜ | Chưa làm | Đợt2. |
| BLOG.2.load | GET edit/404 từ API | ⏸ | BE-YEU-CAU-FE | Có lỗi không tìm thấy demo; API detail chưa có. |
| BLOG.3.insert | Hộp chèn hình/alt | ⬜ | Chưa làm | Đợt3. |
| BLOG.3.clipboard | Paste/drop ảnh | ⬜ | Chưa làm | Đợt3. |
| BLOG.3.upload | Upload URL/tiến trình/lỗi | ⏸ | BE-YEU-CAU-FE | Admin posts/images chưa có. |
| BLOG.3.demo-images | Blob demo/khóa Published | ⬜ | Chưa làm | Đợt3, không base64 vào nội dung. |
| BLOG.3.image-edit | Chọn ảnh/alt/căn/size/xóa | ⬜ | Chưa làm | Đợt3. |
| BLOG.4.preview | Xem trước HTML sạch | ⚠️ | PostTextPreview | Đợt1 chỉ preview plain text React escape; HTML allowlist ở đợt3, không dangerouslySetInnerHTML. |
| BLOG.5.grid | Lưới ảnh trang chủ | ⬜ | Chưa làm | Đợt4. |
| BLOG.5.upload | Upload nhiều ảnh | ⏸ | BE-YEU-CAU-FE | Chưa có Admin homepage-images. |
| BLOG.5.order | PUT order | ⏸ | BE-YEU-CAU-FE | API chưa có, chỉ đề xuất. |
| BLOG.5.delete | Xóa/confirm/alt gallery | ⬜ | Chưa làm | Đợt4. |
| BLOG.6.docs | Tài liệu/tracker/bàn giao | ✅ | DESIGN-SYSTEM, BE-YEU-CAU-FE, tracker, plans/handoff | Cập nhật cùng đợt1. |

## Quyết định đã chốt
- Chỉ một đợt mỗi lần. Không sửa route/auth/API/BE/Public.
- Token nằm trong vùng .admin-layout, bộ UI là adapter của nền dùng chung; icon tự viết thống nhất.
- Không tạo tên thật admin từ email: dùng user.full_name hiện có, fallback email rõ ràng.
- Không sửa lịch sử bàn giao; gắn mốc thời gian cho tài liệu đồ án cũ khi cập nhật hiện trạng.

## Việc còn tồn đọng
- Browser/native pipe unavailable nên chưa có ảnh trước/sau, chưa xác minh trực quan các viewport.
- Lint baseline có 1 warning AuthContext; không thay logic auth để xử lý warning ngoài phạm vi.
- Backend thiếu logo upload, Dashboard/Blog/Reports, tên thật admin/phiếu miễn phí như DB-CAN-LAM; FE không tạo endpoint giả.

## Kết quả đợt 1
Đã hoàn tất F2 (13 dòng) và F4 trong phạm vi code/build/docs; F3-A giữ chưa làm, F3-B chờ chủ vùng. 28 kiểm tra UI SSR/contrast và 27 kiểm tra API/session cũ PASS. Chưa có ảnh trước/sau; không coi đã QA trình duyệt hoặc responsive toàn bộ.

## Kết quả tinh chỉnh plan 25
Việc1–5 đã viết/build/lint/doc. Việc6 chỉ có tiêu đề NHỊP, không tự suy diễn. 12 kiểm tra SSR mục tiêu đạt, 28 kiểm tra UI và 27 kiểm tra API/session cũ vẫn PASS. Không có browser tool để chụp hoặc đo viewport; không tuyên bố đã QA trực quan.

## Quyết định Blog đợt 1
Không thêm Tiptap vì convention cấm dependencies mới; contentEditable tối giản dự kiến đợt2. Đợt1 không render HTML: React escape văn bản, không có dangerouslySetInnerHTML. Đợt3 mới viết sanitizer allowlist tương đương/kiểm tra kỹ trước HTML preview. Không dùng upload Teacher cho Admin. Kho v2 đọc admin_blog cũ, không ghi đè backup. Legacy category chỉ demo, không giả field BE. Sau Lưu nháp giữ compose, sau Published về list; mọi toast nói rõ lưu trên trình duyệt. Chưa QA browser1440/1024/390 do không có công cụ.

## Audit theo mã ADMIN-SPEC — 2026-10-30, lượt 1/3

Các mã F2/F3/BLOG phía trên ghi tiến độ đợt UI, không phải chứng nhận khớp toàn spec. Bảng dưới là kết quả audit Page 1–2; Page 3–8 chưa audit. ✅ khớp qua code; ⚠️ lệch; ❌ thiếu; 🔶 một phần; ⏸ bị chặn; ❓ chưa kiểm chứng.

| Mã task | Tên | Trạng thái | File/endpoint | Ghi chú |
|---|---|---|---|---|
| 1.1 | Ba nút lối tắt | ✅ | D:11; RP:67 (students); Fpages/admin/Classes/ClassesManagement.tsx:53; Fpages/admin/Payments/PaymentsManagement.tsx:36; BControllers/Admin/StudentsController.cs:14/:179; BControllers/Admin/ClassesController.cs:14/:187; BControllers/Admin/PaymentsController.cs:16/:53 | audit 2026-10-30 — Không cần API dashboard riêng. Ba link có action=create; các trang đích đọc query để mở form khi mount. POST có quyền admin. Chưa test thao tác trình duyệt/DB. |
| 1.2 | Bốn KPI | ⚠️ | BProgram.cs:97 + kiểm kê controller ở Tóm tắt; S:4/:10/:11/:13/:14/:16 | audit 2026-10-30 — Thiếu GET dashboard/kpis. FE là số mock: khóa, giáo viên, học viên, blog; thiếu lớp đang mở/doanh thu tháng, không lọc Studying; không API/skeleton/lỗi --. |
| 1.3 | Doanh thu 12 tháng | ❌ | BProgram.cs:97 + kiểm kê; D:8 (toàn hàm chỉ actions/KPI/recent) | audit 2026-10-30 — Không endpoint revenue-by-month, không chuỗi tháng liên tục/zero-fill; Dashboard không có biểu đồ, đơn vị tiền/loading/lỗi. |
| 1.4 | Học viên mới 12 tháng | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không endpoint new-students-by-month; không biểu đồ theo ngày tạo học viên/loading/lỗi. |
| 1.5.1 | Lớp có lịch hôm nay | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không today-classes; thiếu chọn theo thứ/ngày lớp, giờ/GV/phòng/sĩ số/sức chứa/sắp giờ; FE không danh sách/link chi tiết. |
| 1.5.2 | Tổng lớp hôm nay | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không totalToday trong response; FE không phần tóm tắt. |
| 1.6.1 | Lớp sắp đầy | ❌ | BProgram.cs:97 + kiểm kê; D:8 | audit 2026-10-30 — Không almost-full-classes threshold/limit; không lọc tỷ lệ kể cả vừa đầy; FE không progress/link. |
| 2.1.1 | Lưới 4/2 card | ⚠️ | CC:12/:26/:39/:49/:69; BDtos/Admin/CourseResponse.cs:16/:18; BDtos/Common/PagedResult.cs:5; CFG:12/:14; RP:64/:97/:98/:99 | audit 2026-10-30 — GET mặc định16, có items/total/page/pageSize và quyền admin; thiếu currentStudents/maxStudents. activeStudents đếm enrollment Active ở lớp chưa kết thúc, không phải field hợp đồng. FE gọi API thật nhưng bảng, không grid/sĩ số tối đa/sessionsPerWeek/badge giảm giá/skeleton; detail mở modal. finalTuition là tùy chọn nên không tính thiếu bắt buộc. |
| 2.1.2 | Phân trang 16 khóa | ⚠️ | CC:49/:51/:65; BDtos/Common/PagedResult.cs:7; CFG:13; RP:58/:73/:104; Fpages/admin/Components/Ui/Pagination.tsx:7 | audit 2026-10-30 — BE pageSize16 và total alias đúng, nhưng Skip((page-1)*pageSize) int có thể tràn, không bảo đảm trang cực lớn trả rỗng. FE lưu page URL nhưng hiện pager cả <=16 và không scroll-top; trang vượt phạm vi thông thường hiển thị rỗng. |
| 2.2.1 | Tìm tên khóa | 🔶 | CC:57/:60/:63; Fpages/admin/Components/Api/SearchField.tsx:8/:13; RP:73/:91/:98 | audit 2026-10-30 — BE Contains, total sau lọc đúng; không explicit CI_AI, collation thực DB chưa kiểm chứng nên không kết luận kết quả chắc chắn sai. FE debounce300ms/reset page/URL có; không nút xóa riêng, type=search có thể có native clear tùy browser, chưa QA; empty chưa đúng câu spec. |
| 2.3.1 | Thêm khóa | 🔶 | CR:13/:16/:25/:32; CC:90/:95/:110/:113; BProgram.cs:65; CFG:15; RP:78/:81/:85/:106/:107/:109; Fpages/admin/Components/Api/AdminUi.tsx:3; Fservices/apiClient.ts:35 | audit 2026-10-30 — BE đủ phần lớn Range/so sánh, POST201 và kiểm tra trùng409. BandFrom/BandTo/Tuition non-nullable mặc định0 nên không phân biệt bỏ trường bắt buộc với nhập0; 409 chỉ message, không lỗi name. FE có form/HTML validation/chặn busy/đóng/reload; band là number thay dropdown; không preview giá trong form, không hiển thị lỗi từng trường/validate so sánh phía FE; thành công Notice thay toast. DTO400 có errors mặc định ApiController, không khẳng định thiếu mọi lỗi theo trường ở BE. |
| 2.4.1 | Sửa khóa | 🔶 | CC:117/:120/:126/:129/:135; CR:13/:25; BServices/EnrollmentService.cs:52/:60; RP:74/:76/:86/:106/:108 | audit 2026-10-30 — BE có PUT/404/trùng tên, giữ snapshot giá ghi danh; còn thiếu Required số/lỗi409 theo trường như tạo. Không tự sửa lịch lớp cũ; tác động số buổi cần người chốt. FE reuse/prefill đúng, thiếu nhắc chỉ ghi danh mới, field errors và toast; form còn thiếu như 2.3.1. |
| 2.4.2 | Xóa khóa | 🔶 | CC:146/:149/:154/:155; RP:80/:81/:96/:101; Fpages/admin/Components/Api/AdminUi.tsx:3 | audit 2026-10-30 — BE404/409 khi có bất kỳ lớp đúng, nhưng message không nêu số lớp. FE có confirm, lỗi server, reload và lùi trang khi xóa dòng cuối; thành công Notice thay toast. |

### Quyết định và tồn đọng của audit
- Không sửa code; lựa chọn nghiệp vụ/điều hướng chưa chốt, xem AUDIT-ADMIN.md.
- Dashboard vẫn mock; Courses gọi API thật. Có foundation Toast/Skeleton không đồng nghĩa ResourcePage đã tích hợp.
- Đơn giáo viên vẫn có menu/route, trái chủ trương FE hoãn; không xóa trong lượt audit.
- Build FE PASS; lint 0 error, 1 warning AuthContext có sẵn. Không chạy app/browser.
- Lượt tiếp theo: Page 3, 4, 5.

## [2026-10-31] Dashboard — lớp học theo ngày

| Mã | Hạng mục | Trạng thái | File | Ghi chú |
|---|---|---|---|---|
| Dashboard.today | Thay Khóa học gần đây bằng lớp theo ngày | ✅ | Dashboard/Dashboard.tsx, Dashboard/Components/TodayClasses.tsx, Dashboard/Dashboard.css | Mặc định hôm nay giờ Việt Nam; chọn ngày; lọc thứ Mon1–Sun7 và khoảng ngày lớp; mỗi lớp một hàng, sắp giờ buổi đầu; tên lớp/GV/sĩ số Active từ API classes. Lấy đủ các trang; skeleton/empty/error/retry. |

- Đây là thay đổi FE theo yêu cầu ngày 2026-10-31, không sửa BE và không đánh dấu hoàn tất toàn task 1.5 của spec (chưa có endpoint today-classes, giờ/phòng và link chi tiết).
- AUDIT-ADMIN.md là kết quả tại ngày audit 2026-10-30; phần ghi thiếu khối hôm nay là hiện trạng trước thay đổi này.
- Validation: build/typecheck PASS; lint 0 error/1 warning AuthContext có sẵn. Kiểm tra dữ liệu mock 31/10: 3 lớp, 01/11: 0 lớp, 02/11: 5 lớp; module Vite HTTP200. Chưa QA hình ảnh trình duyệt.
