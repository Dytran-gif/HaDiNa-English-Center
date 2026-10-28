---
name: review
description: Giao diff mới nhất cho sub-agent code-reviewer để kiểm tra theo luật trong CLAUDE.md, nhận kết luận PASS/CONCERNS, rồi ghi vào reports/<so>-<slug>-review.md.
disable-model-invocation: true
---

# /review: Review bằng sub-agent

**Cách dùng:** `/review` (sau `/implement`, trước khi commit / mở PR)

## Quy trình

### 1. Tìm báo cáo thực hiện
Lấy file mới nhất trong `reports/` khớp `*-implementation.md`. File này cho biết slug, vùng và danh sách file đã đổi.

### 2. Lấy diff
```bash
git diff HEAD            # chưa commit
git diff main...HEAD     # đã commit trên nhánh tính năng
```

### 3. Giao cho sub-agent `code-reviewer`
Gửi kèm:
- Toàn bộ diff
- Slug + vùng (lấy từ báo cáo)
- Đường dẫn file plan (để đối chiếu tiêu chí hoàn thành)

### 4. Ghi kết quả
Ghi nguyên văn kết luận của sub-agent vào `reports/<so>-<slug>-review.md` (dùng Write). Không sửa nội dung kết luận.

### 5. Báo lại
- Đường dẫn file review
- Kết luận: PASS hoặc CONCERNS
- Nếu CONCERNS: liệt kê các mục chặn phải sửa trước khi commit

**Bước tiếp:** PASS thì commit và mở PR. CONCERNS thì sửa, chạy `/validate`, rồi `/review` lại.
