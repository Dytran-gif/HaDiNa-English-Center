# ADMIN FE TRACKER

Cập nhật lần cuối: 2026-10-30 — đợt 1

Đợt tiếp theo: Đợt 2 — demo state, trang Khóa học và Cài đặt (F3-A.1–3).

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
| F3-A.1 | Demo/chưa có token | ⬜ | AdminLayout, Feedback, bảng | Còn ba thông báo chồng; xử lý đợt 2. |
| F3-A.2 | Khóa học mẫu | ⬜ | Courses, ResourcePage | Tìm kiếm đã debounce; còn skeleton, badge, icon action/confirm. |
| F3-A.3 | Cài đặt chung | ⬜ | Settings | Còn dirty form, match khi gõ, khoảng cách/state. |
| F3-A.4.teachers | Giáo viên | ⬜ | Teachers, ResourcePage | Đợt 3 áp dụng mẫu. |
| F3-A.4.students | Học viên | ⬜ | Students, ResourcePage | Đợt 3. |
| F3-A.4.classes | Lớp học | ⬜ | Classes | Đợt 3. |
| F3-A.4.rooms | Phòng học | ⬜ | Rooms, ResourcePage | Đợt 3. |
| F3-A.4.payments | Học phí | ⬜ | Payments | Đợt 3; chưa thay nghiệp vụ. |
| F3-A.4.blog | Tin tức/Blog | ⬜ | Blog | Đợt 3; API chưa có, phải giữ nhãn demo. |
| F3-A.4.requests | Đơn giáo viên | ⬜ | TeacherRequests | Đợt 3. |
| F3-A.4.reports | Báo cáo | ⬜ | Reports | Đợt 3; dữ liệu minh họa. |
| F3-A.4.dashboard | Dashboard | ⬜ | Dashboard | KPI/chart/empty lớp hôm nay/sắp đầy; BE chưa có. |
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
