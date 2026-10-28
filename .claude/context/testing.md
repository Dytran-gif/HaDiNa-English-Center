# Kiểm thử

## Hiện trạng (thành thật)

- **Chưa có test tự động** ở cả FE lẫn BE.
- "Validation gate" hiện gồm: FE `lint` + `typecheck` (+ `build`), BE `dotnet build`.
- Kiểm tra API bằng tay qua file `.http` (VS Code REST Client / Visual Studio / Rider):
  - `app/backend/EnglishCenter.Api/EnglishCenter.Api/Teacher.http`
  - `app/backend/EnglishCenter.Api/EnglishCenter.Api/EnglishCenter.Api.http` (các request Admin; plan 91 đổi tên thành `Admin.http`)
  - Quy ước: khai báo `@token = ...` một lần ở đầu file rồi dùng `Authorization: Bearer {{token}}`, không dán token vào từng request
  - Khi thêm endpoint, thêm request mẫu vào file `.http` của vùng (`Admin.http`, `Student.http`…).

## Checklist test tay cho mỗi endpoint mới

1. Gọi khi **không có token** thì phải ra 401.
2. Gọi bằng token **sai vai trò** thì 403.
3. Gọi với id **của người khác** (lớp không mình dạy, bài của học viên khác) thì 403/404, không được trả dữ liệu.
4. Body thiếu field bắt buộc thì 400 (ProblemDetails).
5. Vi phạm luật nghiệp vụ thì đúng mã (409/423…) và `message` tiếng Việt dễ hiểu.
6. Đường đúng thì đúng mã (200/201/204) và đúng shape như `docs/api/*.md`.

## Checklist test tay cho mỗi page FE

1. Đăng nhập đúng vai trò thì vào được. Sai vai trò thì bị đẩy về `/`.
2. Đủ 3 trạng thái: đang tải / lỗi (hiện message) / danh sách rỗng.
3. Responsive: thử ở 375px (điện thoại) và 1280px.
4. Thao tác tạo/sửa/xóa xong, reload trang vẫn đúng dữ liệu.

## Khi thêm test tự động (plan 90, chưa bắt buộc)

- BE: project `EnglishCenter.Api.Tests` (xUnit) trong `app/backend/EnglishCenter.Api/`, thêm vào `.slnx`. Ưu tiên test **hàm static thuần**: `IeltsBands.Overall`, `SessionService.StatusOf`, `SubmissionService.GradeQuiz`, `ScheduleService.ComputeEndDate`.
- FE: cần thêm Vitest (là thư viện mới, phải bàn nhóm trước).
- Có test rồi thì thêm `dotnet test` / `npm run test` vào `/validate` và hook Stop.
