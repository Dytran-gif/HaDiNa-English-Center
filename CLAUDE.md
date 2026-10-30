# English Center — Luật chung cho nhóm + agent

ĐỌC FILE NÀY ĐẦU TIÊN. Đây là **bản đồ**, không phải tài liệu đầy đủ: chi tiết nằm trong
`.claude/context/` (đọc khi cần) và `docs/`.

Website trung tâm tiếng Anh, đồ án nhóm 3 người. Một repo, hai app:

| App | Thư mục | Stack | Chạy ở |
|---|---|---|---|
| Frontend | `app/frontend/` | React 19 + react-router v7 + TypeScript + Vite, lint bằng oxlint, **CSS thuần** | http://localhost:5173 |
| Backend | `app/backend/EnglishCenter.Api/` | ASP.NET Core (.NET 10) Web API + EF Core + SQL Server + JWT | http://localhost:5220 |

Có 3 vai trò: `admin` · `teacher` · `student`. Khách (chưa đăng nhập) chỉ xem trang public.

---

## Bản đồ thư mục

```
.
├── CLAUDE.md                 # file này
├── README.md                 # cài đặt + cách dùng quy trình Plan → Implement → Validate → Review
├── .claude/                  # "lớp AI": context, skills, agent review, hooks
├── plans/                    # KẾ HOẠCH: mỗi việc cần làm = 1 file. Xem plans/README.md
├── reports/                  # BÁO CÁO: kết quả /implement và /review
├── docs/
│   ├── BAN-GIAO.md           # nhật ký bàn giao (đọc đầu buổi, ghi cuối buổi)
│   ├── api/                  # hợp đồng API giữa FE và BE (nguồn sự thật)
│   ├── conventions/          # quy ước FE, BE, tech stack
│   └── do-an/                # tài liệu báo cáo đồ án (problem, research, ERD, phân công…)
└── app/
    ├── frontend/             # React app (có CLAUDE.md riêng cho FE)
    └── backend/              # .NET API (có CLAUDE.md riêng cho BE)
```

---

## Quy ước đặt tên

| Lớp | Quy ước | Ví dụ |
|---|---|---|
| FE component + file | `PascalCase.tsx`, CSS đi kèm cùng tên | `CourseCard.tsx` + `CourseCard.css` |
| FE hàm/biến | `camelCase` | `getClassesByTeacher`, `isLoading` |
| FE type/interface | `PascalCase` trong `src/types/` | `Assignment`, `UserRole` |
| BE class/method/property | `PascalCase` | `SessionService.SyncAsync` |
| BE biến cục bộ/tham số | `camelCase`, field private `_camelCase` | `classId`, `_db` |
| BE method async | hậu tố `Async` | `OwnsClassAsync` |
| BE DTO | `<Thứ>Request` / `<Thứ>Response` | `RoomRequest`, `RoomResponse` |
| API route | `api/<vùng>/<tài-nguyên-số-nhiều>`, viết thường, có gạch nối | `api/admin/rooms`, `api/teacher/schedule/leave-requests` |
| JSON | `camelCase` (ASP.NET mặc định) | `enrolledCount`, `dueAt` |
| Giá trị trạng thái | chuỗi `PascalCase` tiếng Anh | `Pending`, `Approved`, `Present` |

---

## Pattern cốt lõi (tóm tắt, chi tiết xem context)

**Backend**
- Controller chia theo **vùng vai trò**: `Controllers/Admin/`, `Controllers/TeacherPortal/`, `Controllers/StudentPortal/` (chưa có), `Controllers/Public/` (chưa có).
- Controller của portal kế thừa lớp base của vùng (vd `TeacherControllerBase`). Lớp base lấy hồ sơ từ JWT và **luôn lọc theo chủ sở hữu** (lớp mình dạy, bài của mình).
- Lỗi trả về `{ "message": "..." }` với mã 400/401/403/404/409/423. Service trả `ServiceResult` / `EnrollmentResult`, **không throw** cho lỗi nghiệp vụ.
- Ngày giờ dùng **giờ địa phương**: `DateOnly` / `TimeOnly` / `DateTime` không có `Z`. Lấy "bây giờ" qua `AppTime`, không gọi `DateTime.Now` rải rác.
- Thêm/sửa entity thì phải tạo **migration** (`dotnet ef migrations add <Ten>`) và commit cả thư mục `Migrations/`.

**Frontend**
- Trang theo vai trò nằm ở `src/pages/<role>/<Feature>/<Feature>.tsx`, khai báo route trong `src/routes.tsx`, bọc `<ProtectedRoute role="...">`.
- Lấy user bằng `useAuth()`, không tạo context/auth mới.
- Nền dùng src/styles/tokens.css; Admin dùng thêm token --admin-* scoped .admin-layout ở pages/admin/Components/Ui/AdminTokens.css. Không đổi token Public/Teacher/Student để sửa Admin. Không Tailwind/Bootstrap hoặc tự cài thư viện.
- Admin đã nối API cho Khóa/GV/HV/Lớp/Đơn/Học phí/Phòng/Cài đặt; Dashboard/Blog/Reports còn minh họa. Gọi qua src/services, không fetch trong page. Design Admin scoped trong pages/admin/Components/Ui; xem docs/design/DESIGN-SYSTEM.md.

---

## Lệnh build & kiểm tra (validation gate)

| Bước | Lệnh | Thư mục |
|---|---|---|
| FE lint | `npm run lint` | `app/frontend` |
| FE typecheck | `npm run typecheck` | `app/frontend` |
| FE build | `npm run build` | `app/frontend` |
| BE build | `dotnet build` | `app/backend/EnglishCenter.Api` |
| BE test | `dotnet test` (khi đã có project test, xem plan `90`) | `app/backend/EnglishCenter.Api` |
| BE migration | `dotnet ef migrations add <Ten>` rồi `dotnet ef database update` | `app/backend/EnglishCenter.Api/EnglishCenter.Api` |

Chạy cả bộ bằng `/validate` trước khi mở PR. Hook Stop tự chạy gate này cho phần code vừa đổi.

---

## Context theo nhu cầu (chỉ đọc khi task chạm tới)

| Module | Đọc khi… |
|---|---|
| `.claude/context/architecture.md` | Thêm tài nguyên/endpoint/trang mới, hiểu luồng FE → BE |
| `.claude/context/backend.md` | Viết controller, service, DTO, entity, migration |
| `.claude/context/frontend.md` | Viết page, component, CSS, mock data, type |
| `.claude/context/auth.md` | Đăng nhập, phân quyền, token, ProtectedRoute |
| `.claude/context/api-contract.md` | Nối FE vào BE, định dạng lỗi, phân trang, ngày giờ trong JSON |
| `.claude/context/data-model.md` | Chạm vào bảng/entity, dữ liệu dùng chung giữa các vùng |
| `.claude/context/datetime.md` | Bất kỳ xử lý ngày, giờ, lịch, hạn nộp, khóa điểm danh |
| `.claude/context/testing.md` | Viết test, kiểm thử thủ công bằng file `.http` |
| `.claude/context/ownership.md` | Trước khi sửa file ngoài vùng của mình |

---

## Luật bắt buộc

- `/validate` phải xanh trước khi mở PR: FE lint + typecheck, BE build.
- **Không tự cài thư viện** (npm hay NuGet). Muốn thêm thì bàn nhóm và cập nhật `docs/conventions/TECH-STACK.md` trước.
- Chỉ sửa trong **vùng của mình** (`ownership.md`). Sửa file dùng chung thì báo nhóm trước.
- API mới hoặc đổi API thì cập nhật `docs/api/*.md` **trong cùng PR**. FE chỉ code theo doc này.
- Mọi endpoint portal phải kiểm tra quyền sở hữu (giáo viên chỉ thấy lớp mình, học viên chỉ thấy dữ liệu mình). Không tin `id` từ client.
- Không commit `.env`, chuỗi kết nối thật hay khóa JWT thật. Hook `security_guard.py` chặn đọc/sửa `.env` và chặn xóa thư mục đệ quy.
- Mỗi migration chỉ do **một người** tạo rồi commit. Người khác pull về và chạy `dotnet ef database update`, không tự tạo migration trùng tên.

---

## Nhịp làm việc

- **Đầu buổi:** "Đọc CLAUDE.md và docs/BAN-GIAO.md, rồi làm tiếp plans/<file>."
- **Làm một việc:** `/plan` → `/implement plans/<file>.md` → `/review` (xem README).
- **Cuối buổi:** `/handoff` để ghi khối bàn giao vào `docs/BAN-GIAO.md`, rồi commit và push.
- Điều gì không ghi vào file đã commit thì coi như mất.

---

## Bẫy hay gặp

- DB chưa có bảng cho chức năng Teacher: phải chạy migration `TeacherFeatures` (plan `00`). Nếu chưa có, API khởi động sẽ lỗi ở `TeacherSeeder`.
- Lỗi validate DTO (`[Required]`, `[Range]`…) do `[ApiController]` trả dạng **ProblemDetails** `{ title, errors: { Field: [..] } }`, **không** phải `{ message }`. FE phải xử lý cả hai dạng.
- `ClassSession.Status` trong DB chỉ có `Scheduled | Cancelled`. `Upcoming/Ongoing/Done` là trạng thái **tính ra** (`SessionService.StatusOf`), không lưu.
- Backend chưa bật CORS cho request chéo origin. FE dev có Vite proxy /api và /uploads tới localhost:5220; production cần reverse proxy hoặc CORS phù hợp.
- FE mặc định đăng nhập thật qua POST /api/auth/login, có lựa chọn demo khi chưa có DB. Token chỉ nằm trong session AuthContext.
- Sáu lỗi typecheck cũ ở Student/import/export đã được sửa tối thiểu trong plan 23; lint còn một warning Fast Refresh ở AuthContext, không có lỗi.
