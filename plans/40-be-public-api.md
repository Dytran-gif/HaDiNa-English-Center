# 40 — BE Public: khóa học, giáo viên, blog, thông tin trung tâm

- **Loại:** backlog
- **Vùng:** Public
- **Người làm:** Hoàng
- **Phụ thuộc:** — (blog cần 21 để có dữ liệu)
- **Độ khó:** Thấp

## Mục tiêu
Trang public (chưa đăng nhập) đọc dữ liệu thật thay cho mock `src/data/courses.ts`, `teachers.ts`, `blogPosts.ts`, `siteConfig.ts`.

## Phạm vi (xem `docs/api/PUBLIC_API.md`)
- `Controllers/Public/`, mọi controller `[AllowAnonymous]`, route `api/public/...`:
  - `GET courses`, `GET courses/{id}` (kèm lớp sắp khai giảng còn chỗ)
  - `GET teachers`, `GET teachers/{id}` (chỉ thông tin công khai: tên, chuyên môn, bằng cấp, ảnh, điểm đánh giá TB, **không** email/SĐT)
  - `GET posts?page=`, `GET posts/{id}`: chỉ `Status = Published`
  - `GET settings`: tên, logo, địa chỉ, SĐT trung tâm + `homepageImages`
  - (tùy chọn) `POST contact`: form tư vấn, cần bảng mới + migration, bàn nhóm
- Cần chốt: FE đang dùng **slug** (`/khoa-hoc/:slug`) nhưng entity chưa có `Slug`. Chọn (a) thêm cột `Slug` + migration, hoặc (b) đổi FE sang `:id`.

## Tiêu chí hoàn thành
- [ ] Gọi không cần token vẫn 200
- [ ] Không lộ dữ liệu riêng tư (email, SĐT GV, bài nháp)
- [ ] `docs/api/PUBLIC_API.md` khớp code
