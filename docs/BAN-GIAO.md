# Nhật ký bàn giao

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
