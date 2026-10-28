# Frontend — English Center (React)

Luật chung của cả repo nằm ở **`../../CLAUDE.md`** (đọc trước). File này chỉ ghi phần riêng của FE.
Cấu trúc và pattern chi tiết: `../../.claude/context/frontend.md`. Quy ước: `../../docs/conventions/FRONTEND.md`.

## Tech stack (ĐÃ CHỐT, không tự ý thêm thư viện)
React 19 · react-router-dom v7 · TypeScript · Vite · oxlint · **CSS thuần** + tokens (`src/styles/tokens.css`).
Không Tailwind, không Bootstrap. Xem `../../docs/conventions/TECH-STACK.md`.

## Lệnh
```
npm install
npm run dev          # http://localhost:5173
npm run lint
npm run typecheck
npm run build
```
BẮT BUỘC: `npm run lint && npm run typecheck` phải XANH trước khi push.

## Dữ liệu
- Hiện tại: MOCK trong `src/data/*.ts` (+ `useLocalCollection` cho CRUD). Dữ liệu JSON cũ đã chuyển ra `docs/do-an/du-lieu-cu/`, app không dùng.
- Backend thật: `../backend/` (ASP.NET Core). Hợp đồng API: `../../docs/api/`.
- Nối API qua `src/services/` (plan `01`). Page không gọi `fetch` trực tiếp.

## Đăng nhập: nền dùng chung ĐÃ CÓ (do Hoàng làm, đừng viết lại)
```ts
import { useAuth } from "../../context/AuthContext";
const { user, logout } = useAuth();   // user.role = "student" | "teacher" | "admin"
```
- Trang cần bảo vệ: bọc `<ProtectedRoute role="...">` trong `routes.tsx`.
- Tài khoản demo (mật khẩu 123456): `student@demo.com` / `teacher@demo.com` / `admin@demo.com`.
- Đang mock. Chuyển sang `POST /api/auth/login` ở plan `03`, giữ nguyên `useAuth()`.

## Ai giữ phần nào
Bảng đầy đủ ở `../../.claude/context/ownership.md`. Tóm tắt:
- Hoàng: trang public (`src/pages/*.tsx`, `components/sections/`, `components/layout/`) + nền auth (`context/`, `ProtectedRoute.tsx`).
- Nam: `src/pages/student/`, `src/data/StudentData/`, `src/types/StudentTypes/`.
- Dytran-gif (Duy): `src/pages/admin/`, `src/pages/teacher/` + `src/data/AdminData/`, `src/data/TeacherData/`.

## FILE DÙNG CHUNG: sửa phải báo nhóm trước
`src/routes.tsx` · `src/styles/tokens.css` · `src/components/ui/` · `src/context/` · `src/services/apiClient.ts` · `src/data/index.ts` · `src/types/index.ts` · `package.json`
(chỗ dễ đẻ component trùng và gây conflict nhất, vd 3 người tự làm 3 cái Sidebar)

## GIAO DIỆN PUBLIC: màu & animation (do Hoàng làm)
Quy tắc quan trọng để KHÔNG đụng dashboard:
- Trang public đi qua PageShell (class `.page-shell`). Dashboard student/teacher/admin dùng layout riêng, KHÔNG nằm trong `.page-shell`.
- Muốn đổi MÀU trang public: sửa `src/styles/public-theme.css`, chỉ ghi đè token trong phạm vi `.page-shell { --blue: ... }`.
  TUYỆT ĐỐI không sửa token gốc trong `src/styles/tokens.css` cho việc này, vì header/sidebar của teacher và admin cũng dùng `--blue`.
- `public-theme.css` được nạp 1 lần trong `PageShell.tsx`.
- Hiệu ứng: `<Reveal/>` (`src/components/sections/Reveal.tsx`) bọc từng section trang chủ để mờ hiện khi cuộn. Hero có animation lúc tải trang. Tất cả đều tôn trọng `prefers-reduced-motion`.

## KHẢO SÁT CHỌN KHOÁ (trang chủ, do Hoàng làm)
- Khối `CourseSurvey` (`src/components/sections/CourseSurvey.tsx` + `.css`): hỏi 3 câu (mục tiêu / trình độ / nhịp độ) rồi gợi ý 1 khoá học.
- Câu hỏi + logic gợi ý: `src/components/sections/surveyConfig.ts` (đặt cạnh component, KHÔNG để trong `src/data/` để tránh thư mục dùng chung).
- Slug gợi ý khớp `src/data/courses.ts`, link tới `/khoa-hoc/:slug`. Khi nối API xem plan `40` (slug hay id).
- Muốn chỉnh khoá gợi ý thì sửa hàm `recommendCourse` trong `surveyConfig.ts`.
