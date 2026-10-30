# Nhật ký bàn giao
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
