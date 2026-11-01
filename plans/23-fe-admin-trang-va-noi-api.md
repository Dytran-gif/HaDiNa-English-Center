# 23 — FE Admin khớp API hiện có

- **Loại:** plan
- **Vùng:** Admin FE
- **Người làm:** Codex
- **Ngày:** 2026-10-30

## Phạm vi
Nối Khóa học, Phòng học, Học phí; thêm Giáo viên, Học viên, Lớp học, Đơn giáo viên và Cài đặt. Dùng đúng API hiện có, không tự thêm API/schema. Dashboard/Blog/Reports chưa có BE giữ demo và ghi rõ trên giao diện. Giữ route /admin/users bằng redirect sang /admin/students để không phá liên kết, bổ sung menu riêng cho HV/GV.

## Ảnh hưởng vùng khác
- src/routes.tsx: thêm route admin.
- src/context/AuthContext.tsx, src/pages/Login.tsx: thêm loginApi/token trong context hiện có; giữ login demo và chữ ký cũ, token chỉ lưu cùng session AuthContext. Cập nhật token sau đổi mật khẩu, logout nếu 401.
- src/services/apiClient.ts: fetch/chuẩn hóa cả message và ProblemDetails, không thêm thư viện.
- vite.config.ts: proxy /api và /uploads chỉ khi dev, tránh thay CORS BE. Production cần reverse proxy tương ứng hoặc VITE_API_URL.
- Lỗi typecheck baseline: 4 import React dư, 1 đường dẫn type sai, 1 export PageTitle sai ở vùng Student/barrel; chỉ sửa tối thiểu để gate chạy được, không đổi logic Student.
- Không sửa BE, migration, entities, model, DB, package dependencies hoặc plans 00/01/03.

## Các task theo thứ tự
1. [x] Auth/API client, kiểu và hook truy vấn có abort/loading/error; development proxy.
2. [x] Quản lý GV/HV/khóa/phòng: CRUD, tìm/lọc/phân trang, detail, khóa/mở/reset; email update khóa vì BE hiện không nhận email.
3. [x] Lớp học + lịch tuần cấu trúc, detail/ghi danh/rút; đơn GV duyệt/từ chối.
4. [x] Cài đặt trung tâm, đổi mật khẩu/token; học phí snapshot/tạo/biên lai/in, lịch sử HV.
5. [x] Route/menu/title, responsive, trạng thái demo/thật; sửa gate baseline tối thiểu, build và kiểm tra UI, reports/handoff.

## Kiểm tra
npm.cmd run lint; npm.cmd run typecheck; npm.cmd run build tại app/frontend. Không khởi động BE vì tự migrate/seed. Preview FE để QA giao diện; không tuyên bố đã test tích hợp DB. Baseline typecheck đang có 6 lỗi đã ghi trên; lint có 1 warning only-export-components.

## Kết quả
Đã hoàn tất phần FE tương thích API hiện có. Lint PASS (1 warning baseline), typecheck PASS, build PASS; node scripts/verify-admin.mjs: 27/27 PASS. Không có browser host để QA hình ảnh; chưa E2E với DB. Dashboard/Blog/Reports vẫn demo có nhãn; email update và logo upload chờ BE. Hướng dẫn: docs/admin/FE-ADMIN.md.
