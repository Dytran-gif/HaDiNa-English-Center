# API công khai cho khách (SPEC, CHƯA CODE)

> **Trạng thái: đề xuất** (plan 40). Không cần token: `[AllowAnonymous]`, nằm ở `Controllers/Public/`.
> **Không** trả dữ liệu riêng tư: email / SĐT giáo viên, bài nháp, thông tin học viên.

| Method | URL | Mô tả | |
|---|---|---|---|
| GET | `/api/public/settings` | `{ name, logoUrl, address, phone, homepageImages: [{ url, altText }] }` | ⬜ |
| GET | `/api/public/courses?search=` | `[{ id, slug?, name, description, bandFrom, bandTo, totalSessions, sessionsPerWeek, tuition, discountPercent, finalTuition }]` | ⬜ |
| GET | `/api/public/courses/{idOrSlug}` | Chi tiết + `upcomingClasses` (lớp `Upcoming` còn chỗ: tên, ngày khai giảng, lịch tuần, `seatsLeft`) + syllabus | ⬜ |
| GET | `/api/public/teachers` | `[{ id, slug?, fullName, specialty, degree, avatarUrl, ratingAverage, ratingCount }]` (chỉ `Teaching`) | ⬜ |
| GET | `/api/public/teachers/{idOrSlug}` | + lớp đang dạy, vài nhận xét đánh giá (ẩn tên học viên) | ⬜ |
| GET | `/api/public/posts?page=1&pageSize=9` | Bài `Published`, mới nhất trước (phân trang) | ⬜ |
| GET | `/api/public/posts/{idOrSlug}` | Chi tiết bài. 404 nếu chưa publish | ⬜ |
| POST | `/api/public/contact` | (tùy chọn) form tư vấn `{ fullName, phone, email?, courseId?, message }`. Cần bảng mới | ⬜ |

**Cần chốt (plan 40):** FE đang dùng route theo **slug** (`/khoa-hoc/:slug`, `/giao-vien/:slug`, `/blog/:slug`), DB chưa có cột `Slug`.
- (a) Thêm cột `Slug` cho `Course`, `Teacher`, `Post` + migration, hoặc
- (b) Đổi route FE sang `:id`.
