# English Center — Backend (EnglishCenter.Api)

ASP.NET Core Web API (.NET 10) + EF Core + SQL Server + JWT.

## Yêu cầu
- .NET SDK 10
- SQL Server (Developer / Express / LocalDB)

## Chạy
```powershell
cd EnglishCenter.Api\EnglishCenter.Api
dotnet run          # tự tạo/cập nhật DB EnglishCenterDb (xem docs/DATABASE.md)
```
API ở `http://localhost:5220`. Tài khoản demo (mật khẩu `123456`): `admin@demo.com`, `teacher@demo.com`, `student@demo.com`.

## Tài liệu
- Hướng dẫn cho người + agent: [`CLAUDE.md`](./CLAUDE.md)
- Hợp đồng API: [`../../docs/api/`](../../docs/api/README.md)
- Việc cần làm: [`../../plans/`](../../plans/README.md)
