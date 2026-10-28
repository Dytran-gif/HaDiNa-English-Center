# 41 — FE Public: nối trang public vào API

- **Loại:** backlog
- **Vùng:** Public
- **Người làm:** Hoàng
- **Phụ thuộc:** 01, 40
- **Độ khó:** Vừa

## Phạm vi
- `src/services/public/{courses,teachers,posts,settings}.ts`
- Trang: `Courses`, `CourseDetail`, `Teachers`, `TeacherDetail`, `Blog`, `BlogDetail`, khối trang chủ (`CourseShowcase`, `NewsBlog`, `Testimonials`…), `Footer` (thông tin trung tâm)
- Giữ fallback mock khi API lỗi? **Không**: hiện trạng thái lỗi rõ ràng (luật chung). Riêng trang chủ có thể ẩn khối lỗi.
- `CourseSurvey` gợi ý theo slug/id: cập nhật theo lựa chọn ở plan 40.

## Tiêu chí hoàn thành
- [ ] Dữ liệu admin sửa (khóa học, blog) hiện ngay ở trang public
- [ ] lint + typecheck xanh
