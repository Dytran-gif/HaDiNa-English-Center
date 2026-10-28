# 91 — Dọn dẹp file thừa / cấu hình trùng

- **Loại:** backlog
- **Vùng:** Chung (mỗi mục hỏi chủ vùng trước khi xóa)
- **Người làm:** —
- **Phụ thuộc:** —
- **Độ khó:** Thấp

## Danh sách (đã kiểm tra, không còn nơi nào import)
| File | Vì sao thừa | Chủ vùng |
|---|---|---|
| `app/frontend/src/pages/teacher/index.tsx` | placeholder cũ, `routes.tsx` dùng `teacher/Dashboard/Dashboard` | Duy |
| `app/frontend/src/pages/admin/index.tsx` | placeholder cũ, `routes.tsx` dùng `admin/Dashboard/Dashboard` | Admin |
| `app/backend/.../WeatherForecast.cs` | file mẫu của template .NET | — |
| `app/backend/.../EnglishCenter.Api.http` | thực chất là file test **Admin**, token dán cứng ở từng request. Đổi tên thành `Admin.http`, dùng biến `@token` (đã khai báo ở đầu file) thay cho token dán sẵn | Admin |
| `Program.cs`: `UseHttpsRedirection()` và `UseAuthorization()` gọi 2 lần | trùng (sửa trong plan 01) | Chung |
| `AppTime.Today` vs `SessionService.Today` vs `Today()` riêng trong `ClassesController` | 3 cách lấy "hôm nay", nên thống nhất dùng `AppTime` | Chung |

## Lưu ý
- `useLocalCollection.ts` chỉ xóa khi **mọi** trang CRUD đã nối API (sau 23, 30).
- `src/data/*` mock: xóa dần theo từng trang đã nối API, không xóa một lần.
