# Quy ước code Frontend (Conventions)

Cả nhóm + agent theo đúng bộ này để code ghép được với nhau, không đẻ trùng.
File này là "luật code"; tech stack đã chốt xem docs/conventions/TECH-STACK.md.

## Nguyên tắc chung
- KHÔNG tự cài thêm thư viện. Cần lib mới → bàn nhóm, cập nhật docs/conventions/TECH-STACK.md trước.
- Trước khi push: `npm run lint && npm run typecheck` phải XANH.
- Sửa file DÙNG CHUNG (routes.tsx, styles/tokens.css, components/ui/, context/, data/, types/)
  → báo nhóm trước.

## Đặt tên
- Component & file component: PascalCase — CourseCard.tsx, StudentDashboard.
- Hàm, biến: camelCase — getEnrollmentsByUser, isLoading.
- Type/interface: PascalCase — User, UserRole.
- File CSS đi kèm component: cùng tên component — CourseCard.tsx + CourseCard.css.

## Thêm một PAGE mới
1. Tạo file trong src/pages/ (hoặc src/pages/<role>/ nếu là trang trong dashboard).
2. Khai báo route trong src/routes.tsx.
3. Trang cần đăng nhập → bọc <ProtectedRoute role="...">...</ProtectedRoute>.
4. Tái dùng component có sẵn trong src/components/ui/ — KHÔNG chế lại cái đã có.

## Thêm một COMPONENT mới
- Dùng chung nhiều nơi → src/components/ui/ (vd Button, Card, Tag).
- Khối riêng của trang chủ → src/components/sections/.
- Khung layout (Header/Footer/Shell) → src/components/layout/.
- Trước khi tạo: xem ui/ đã có cái tương đương chưa (tránh 3 người làm 3 cái Button/Sidebar).

## Styling
- Màu / khoảng cách / font: chỉ dùng biến trong src/styles/tokens.css. KHÔNG hardcode màu (#fff, 16px...).
- Cần token mới → thêm vào tokens.css và báo nhóm (đây là file dùng chung).
- Không dùng Tailwind/Bootstrap (xem docs/conventions/TECH-STACK.md).

## Dữ liệu (mock)
- Data giả LUÔN ở src/data/*.ts, export qua src/data/index.ts.
- Type của data đặt trong src/types/*.ts, export qua src/types/index.ts.
- KHÔNG hardcode data rải rác trong page. KHÔNG dùng dữ liệu cũ ở docs/do-an/du-lieu-cu/ (app không dùng).

## Đăng nhập / phân quyền
- Lấy user đang đăng nhập: const { user, logout } = useAuth();  // từ src/context/AuthContext
- user.role: "student" | "teacher" | "admin".
- KHÔNG tự tạo context/auth riêng — dùng lại nền có sẵn.

## Git
- Mỗi người làm trên nhánh riêng theo vùng của mình, mở PR về main.
- Commit nhỏ, thường xuyên, message rõ nghĩa.
- CUỐI buổi: chạy /handoff (ghi docs/BAN-GIAO.md) rồi push.