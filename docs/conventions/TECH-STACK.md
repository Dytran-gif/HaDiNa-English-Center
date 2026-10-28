# Tech Stack: CHÍNH THỨC (đã chốt cả nhóm)

Đây là nguồn sự thật duy nhất về công nghệ dùng trong dự án. Docs khác và code phải khớp với file này.
Muốn thêm hoặc đổi thư viện (npm hay NuGet) thì bàn nhóm trước, rồi cập nhật file này **trước khi** cài.

## Frontend (`app/frontend/`)
- React 19
- react-router-dom v7: định tuyến
- TypeScript
- Vite: dev server + build
- oxlint: lint

### Styling
- CSS THUẦN + design tokens (`src/styles/tokens.css`)
- KHÔNG dùng Tailwind, KHÔNG dùng Bootstrap (docs cũ từng ghi hai cái này là phương án cân nhắc, nay đã bỏ)

### Dữ liệu
- Hiện tại: mock trong `src/data/*.ts`
- Đích: gọi API backend qua `src/services/` (plan 01). Dùng `fetch` có sẵn, **không** axios

### Chưa dùng (nếu cần sẽ bàn nhóm)
- State library (Redux / Zustand…)
- Thư viện gọi API (axios, react-query…)
- Thư viện form
- Test runner FE (Vitest)

## Backend (`app/backend/EnglishCenter.Api/`)
- .NET 10, ASP.NET Core Web API (Controllers)
- Entity Framework Core 10 + SQL Server (`Microsoft.EntityFrameworkCore.SqlServer`)
- `dotnet-ef` (global tool) để tạo migration
- JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- BCrypt.Net-Next: băm mật khẩu
- OpenAPI (`Microsoft.AspNetCore.OpenApi`), bật ở Development
- Xuất Excel: tự viết (`Services/XlsxWriter.cs`), **không** dùng thư viện ngoài

### Chưa dùng (nếu cần sẽ bàn nhóm)
- Project test (xUnit), xem plan 90
- AutoMapper, MediatR, FluentValidation (giữ đơn giản: DTO + DataAnnotations)

## Công cụ
- Node 20+ / npm
- .NET SDK 10
- SQL Server (LocalDB / Express / Developer) trên máy
- Claude Code (tùy chọn) + harness trong `.claude/`
