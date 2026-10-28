---
name: plan
description: Phân tích một việc (ticket / mục trong plans/ / mô tả tính năng), đọc code liên quan, rồi viết kế hoạch chi tiết vào plans/<so>-<slug>.md. Bước này KHÔNG viết code.
disable-model-invocation: true
---

# /plan: Phân tích + lập kế hoạch

**Cách dùng:** `/plan <mô tả việc>` hoặc `/plan plans/<file-backlog>.md` (để làm chi tiết một mục backlog).

Kết quả là **một file kế hoạch** trên đĩa. Không sửa code ở bước này.

## Quy trình

### 1. Hiểu việc cần làm
Rút ra từ `$ARGUMENTS`:
- Loại việc: tính năng mới / mở rộng / sửa lỗi / nối API / refactor.
- **Vùng**: Public / Admin / Teacher / Student / Chung. Dựa vào đó tra người giữ trong `.claude/context/ownership.md`.
- Lớp bị ảnh hưởng: doc API · entity/migration · DTO · service · controller · FE type · FE service · FE page.
- Tiêu chí hoàn thành đo được.

### 2. Đọc code (bắt buộc, không đoán)
- Đọc `CLAUDE.md`, rồi các module `.claude/context/` liên quan (bảng "Context theo nhu cầu").
- Đọc **mọi file sẽ sửa**, ghi số dòng thật.
- Đọc **file mẫu gần nhất**:
  - Controller CRUD đơn giản: `Controllers/Admin/RoomsController.cs`
  - Controller portal có chủ sở hữu: `Controllers/TeacherPortal/TeacherControllerBase.cs` + một controller con
  - Service trả kết quả: `Services/SubmissionService.cs` (`ServiceResult`)
  - Page CRUD FE: một page trong `src/pages/admin/` hoặc `src/pages/teacher/` dùng `useLocalCollection`
- Đọc doc API liên quan trong `docs/api/`.

Xác định: file sửa · file tạo · có cần migration không · có chạm file dùng chung không.

### 3. Nghĩ về rủi ro
- **Quyền sở hữu**: endpoint có lọc theo `TeacherId`/`StudentId` từ token chưa? Có lộ dữ liệu người khác không?
- **Ngày giờ**: giờ địa phương, không `Z` (`datetime.md`).
- **Trường hợp biên**: danh sách rỗng, null, trùng lịch, đã khóa, đã có bài nộp, lớp đầy.
- **Hợp đồng API**: FE đang chờ shape nào? Đổi field có làm vỡ page nào không?
- **Vùng khác**: có phải sửa file dùng chung / file của người khác không? Ghi rõ.
- **Migration**: tên gì, ai tạo, có xung đột với migration đang mở ở nhánh khác không?

### 4. Ghi file kế hoạch
Dùng **Write** tạo `plans/<so>-<slug>.md`. Số theo `plans/README.md`. Nếu đang làm chi tiết một file backlog có sẵn thì **ghi đè chính file đó**. Mẫu: `plans/_TEMPLATE.md`.

### 5. Báo lại
- Đường dẫn file plan
- Độ khó: Thấp / Vừa / Cao
- Rủi ro chính
- Ảnh hưởng vùng khác (nếu có)
- Độ tự tin N/10 rằng `/implement` chạy xong một lượt

**Bước tiếp:** `/implement plans/<so>-<slug>.md`
