# English Center — Website trung tâm tiếng Anh

Đồ án nhóm 3 người. Trang chủ công khai + dashboard cho **Admin / Giáo viên / Học viên**.

| | Thư mục | Stack |
|---|---|---|
| Frontend | [`app/frontend/`](./app/frontend/) | React 19 + Vite + TypeScript, CSS thuần |
| Backend | [`app/backend/`](./app/backend/) | ASP.NET Core (.NET 10) + EF Core + SQL Server + JWT |

Repo dùng khung **harness** cho Claude Code: luật + context + quy trình **Plan → Implement → Validate → Review** để cả nhóm (và agent) code cùng một kiểu.

---

## Bắt đầu nhanh

**Yêu cầu:** Node 20+, .NET SDK 10, SQL Server, Python 3 (cho hooks), Claude Code (tùy chọn).

```powershell
# 1. Backend
cd app\backend\EnglishCenter.Api\EnglishCenter.Api
dotnet tool install --global dotnet-ef        # lần đầu
dotnet ef database update
dotnet run                                    # http://localhost:5220

# 2. Frontend (terminal khác)
cd app\frontend
npm install
npm run dev                                   # http://localhost:5173
```

Tài khoản demo, mật khẩu `123456`: `admin@demo.com` · `teacher@demo.com` · `student@demo.com`

> ⚠️ Trước khi chạy BE lần đầu cần có migration `TeacherFeatures`: xem [`plans/00`](./plans/00-be-migration-teacher-features.md).

---

## Cấu trúc repo

```
.
├── CLAUDE.md                     # LUẬT CHUNG: đọc đầu tiên (người + agent)
├── README.md                     # file này
├── .claude/
│   ├── settings.json             # nối hooks vào Claude Code (bản Windows)
│   ├── settings.macos-linux.json # bản cho macOS/Linux
│   ├── context/                  # tài liệu theo mảng, agent đọc khi cần
│   │   ├── architecture.md       #   luồng FE→BE, 4 vùng, thứ tự thêm tính năng
│   │   ├── backend.md            #   controller/service/DTO/entity/migration
│   │   ├── frontend.md           #   page/component/CSS/mock/services
│   │   ├── auth.md               #   JWT, vai trò, thu hồi token, AuthContext
│   │   ├── api-contract.md       #   định dạng JSON, lỗi, phân trang, ngày giờ
│   │   ├── data-model.md         #   nhóm bảng, ai ghi/ai đọc, giá trị trạng thái
│   │   ├── datetime.md           #   giờ địa phương, AppTime, mốc 48h/24h
│   │   ├── testing.md            #   test tay bằng .http, checklist
│   │   └── ownership.md          #   ai giữ thư mục nào, file dùng chung
│   ├── skills/                   # lệnh: /plan /implement /validate /review /handoff
│   ├── agents/code-reviewer.md   # sub-agent review theo luật
│   └── hooks/                    # lint sau khi sửa · gate trước khi dừng · chặn .env
├── plans/                        # VIỆC CẦN LÀM: mỗi việc 1 file (README.md = bảng trạng thái)
├── reports/                      # kết quả /implement và /review
├── docs/
│   ├── BAN-GIAO.md               # nhật ký bàn giao giữa các buổi
│   ├── api/                      # HỢP ĐỒNG API: README, ADMIN, TEACHER, STUDENT, PUBLIC
│   ├── conventions/              # FRONTEND.md, BACKEND.md, TECH-STACK.md
│   └── do-an/                    # tài liệu báo cáo đồ án + ERD + dữ liệu cũ
└── app/
    ├── frontend/                 # React app (CLAUDE.md riêng)
    │   └── src/
    │       ├── pages/{admin,teacher,student}/<Feature>/
    │       ├── components/{ui,layout,sections}/
    │       ├── services/         # (plan 01) lớp gọi API
    │       ├── context/ · hooks/ · data/ · types/ · styles/
    └── backend/                  # .NET API (CLAUDE.md riêng)
        └── EnglishCenter.Api/EnglishCenter.Api/
            ├── Controllers/{Admin,TeacherPortal,StudentPortal,Public}/
            ├── Dtos/{Admin,TeacherPortal,StudentPortal,Common}/
            ├── Entities/ · Data/ · Services/ · Migrations/
            └── *.http            # request mẫu test tay
```

### Bốn vùng, khớp nhau giữa FE và BE

| Vùng | FE | API | BE | Người |
|---|---|---|---|---|
| Public | `src/pages/*.tsx` | `api/public` | `Controllers/Public/` | Done |
| Admin | `src/pages/admin/` | `api/admin` | `Controllers/Admin/` | Hoàng |
| Teacher | `src/pages/teacher/` | `api/teacher` | `Controllers/TeacherPortal/` | Duy |
| Student | `src/pages/student/` | `api/student` | `Controllers/StudentPortal/` | Nam |

---

## Quy trình làm một việc

```
plans/NN-....md (backlog)
   │  /plan plans/NN-....md        → agent đọc code, viết kế hoạch chi tiết (không code)
   ▼
plans/NN-....md (plan)
   │  /implement plans/NN-....md   → làm từng task + kiểm tra từng bước → reports/NN-...-implementation.md
   ▼                                 (hook Stop tự chạy lint/typecheck/build, đỏ thì không cho dừng)
   │  /review                      → sub-agent code-reviewer → reports/NN-...-review.md
   ▼
commit + PR  →  /handoff (cuối buổi, ghi docs/BAN-GIAO.md)
```

Không dùng Claude Code? Vẫn theo đúng thứ tự đó bằng tay: đọc plan, code, chạy lệnh kiểm tra, tự soát theo checklist trong `.claude/agents/code-reviewer.md`.

**Câu mở đầu buổi cho agent:**
> Đọc CLAUDE.md và docs/BAN-GIAO.md, rồi làm tiếp plans/<file>.md của tôi.

### Lệnh kiểm tra (validation gate)

| | Lệnh | Thư mục |
|---|---|---|
| FE | `npm run lint` · `npm run typecheck` · `npm run build` | `app/frontend` |
| BE | `dotnet build` | `app/backend/EnglishCenter.Api` |

---

## Hooks (tự chạy trong Claude Code)

| Hook | File | Làm gì |
|---|---|---|
| PreToolUse | `security_guard.py` | Chặn đọc/sửa `.env` thật và lệnh xóa thư mục đệ quy (`rm -rf`…) |
| PostToolUse | `post_tool_use_lint.py` | Sửa file `.ts/.tsx` thì chạy `oxlint`, sửa `.cs` thì chạy `dotnet build`. Chỉ cảnh báo |
| Stop | `stop_validate.py` | Phần FE/BE có thay đổi (theo `git status`) phải lint + typecheck / build xanh mới cho agent dừng |

`settings.json` viết cho **Windows** (`python "%CLAUDE_PROJECT_DIR%\..."`). Máy macOS/Linux: chép nội dung `settings.macos-linux.json` sang `.claude/settings.local.json` (không commit).

---

## So với template gốc (harness-engineering-demo)

| Template | Ở đây |
|---|---|
| FastAPI + Next.js + Postgres | ASP.NET Core + React/Vite + SQL Server |
| ruff / mypy / pytest / vitest | oxlint / tsc / `dotnet build` (chưa có test, plan 90) |
| `/plan` `/implement` `/validate` `/review` | giữ nguyên + thêm `/handoff` (nhịp bàn giao của nhóm) |
| MCP `codebase-search` (chỉ đọc Python) | **bỏ** vì không đọc được C#/TS. Agent dùng Grep/Glob |
| Ralph loop (`claude -p` tự chạy nhiều vòng) | **bỏ** vì tốn credit Agent SDK và cần sandbox. Có thể thêm sau |
