# Frontend — React + Vite + CSS thuần

Gốc: `app/frontend/`. Quy ước đầy đủ: `docs/conventions/FRONTEND.md`. Tech stack: `docs/conventions/TECH-STACK.md`.

## Cấu trúc

```
src/
├── main.tsx · App.tsx · routes.tsx     # entry + toàn bộ route (routes.tsx là file DÙNG CHUNG)
├── context/AuthContext.tsx             # useAuth() — DÙNG CHUNG
├── components/
│   ├── ProtectedRoute.tsx
│   ├── ui/          # component dùng chung: Button, Card, Modal, FormField, Tag, StatBlock…
│   ├── layout/      # Header, Footer, PageShell (trang public)
│   └── sections/    # khối trang chủ (Hero, CourseSurvey, …)
├── pages/
│   ├── *.tsx                      # trang public (Home, Courses, Blog…)
│   ├── admin/<Feature>/…          # mỗi feature 1 thư mục, có Layout/ và Components/ riêng
│   ├── teacher/<Feature>/…
│   └── student/<Feature>/…
├── services/        # (plan 01) lớp gọi API — page KHÔNG gọi fetch trực tiếp
├── hooks/useLocalCollection.ts    # CRUD mock trên localStorage (sẽ bỏ khi nối API)
├── data/            # mock: chung ở gốc; AdminData/ TeacherData/ StudentData/ theo vùng
├── types/           # type theo entity, export qua index.ts (barrel)
└── styles/          # tokens.css (DÙNG CHUNG), global, reset, public-theme
```

## Thêm một trang trong dashboard

1. `src/pages/<role>/<Feature>/<Feature>.tsx` (+ `<Feature>.css`). Component con riêng của trang để trong `<Feature>/Components/`.
2. Thêm `<Route path="<feature>" element={...} />` vào nhánh `/<role>` trong `src/routes.tsx` (file dùng chung, báo nhóm).
3. Thêm mục menu vào `src/data/<Role>Data/sidebarMenuItems.ts` và tiêu đề vào `pageTitles.ts`.
4. Tái dùng `src/components/ui/` trước khi tạo component mới.

## Styling

- Chỉ dùng biến trong `src/styles/tokens.css` (`var(--blue)`, khoảng cách, font). Không hardcode màu hay px tùy tiện.
- Dashboard dùng CSS chung theo vùng: `admin-shared.css`, `teacher-shared.css`, `student/General.css`.
- Trang public đổi màu trong `public-theme.css`, giới hạn trong `.page-shell`. Không sửa token gốc.
- Không Tailwind, không Bootstrap, không thư viện UI.

## Dữ liệu

- **Hiện tại**: mock trong `src/data/`. Trang CRUD dùng `useLocalCollection(key, seed)`.
- **Khi nối API** (xem `api-contract.md`): page gọi `src/services/<vùng>/<ten>.ts`. Service gọi `apiClient` rồi map dữ liệu API (camelCase) sang type FE.
- Type FE cũ đang dùng `snake_case` (`assignment_id`, `full_name`), còn API trả `camelCase`. **Chỉ map trong service**, không đổi tên field rải rác trong page.
- Mỗi page nối API phải xử lý đủ 3 trạng thái: đang tải · lỗi (hiện `message`) · rỗng.

## Kiểm tra

```
npm run lint        # oxlint
npm run typecheck   # tsc -b --noEmit
npm run build
```

## Không làm

- Không cài thư viện (axios, redux, react-query, zustand, form lib…) khi chưa bàn nhóm.
- Không tạo context/auth riêng. Không tự làm Sidebar/Button mới khi `ui/` hoặc layout của vùng đã có.
- Không import `/data/*.json` cũ (đã chuyển sang `docs/do-an/du-lieu-cu/`).
- Không lưu token ở chỗ nào khác ngoài `AuthContext`.
