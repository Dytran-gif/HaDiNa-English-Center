# Kiểm tra Admin không dùng DB

Từ gốc repo:

```powershell
dotnet run --project tools/VerifyAdmin/VerifyAdmin.csproj --no-launch-profile
```

Sau restore đầu tiên có thể thêm `--no-restore`. Dùng framework và ProjectReference đã có, không thêm test package.

Chương trình chỉ kiểm tra validation/serialization, phân trang, múi giờ, quyền controller, zero-fill và `ToQueryString()` của SQL Server provider. Không chạy Program của API, không mở kết nối SQL, không migrate/seed. Đây không phải bộ integration test thay cho môi trường SQL Server.
