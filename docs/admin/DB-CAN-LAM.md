# DB cần làm — Admin

Cập nhật: 2026-10-30. Không thay entity/model/migration trong đợt này.

| Bảng | Cột / ràng buộc | Lý do / việc người phụ trách DB cần làm | Task |
|---|---|---|---|
| Payments | Amount, CK_Payments_Amount (Amount > 0) | Spec cho phép Tuition = 0. Chốt cho phép phiếu 0 (constraint >= 0) hoặc đổi nghiệp vụ spec. POST hiện trả 400 cho amount <= 0. | 6.3.1 — ⏸ phần phiếu miễn phí |
| Users | Thiếu họ tên admin | User chỉ có Email, admin không có hồ sơ. Cần tên hiển thị/hồ sơ admin để in đúng tên người lập. Tạm dùng Email ở createdByName/createdByEmail. | 6.4.1 — ⏸ phần tên người lập |

Schema hiện có đủ cho phần Payments còn lại và classes/available. Collation ở query không cần migration; chưa kiểm chứng thực thi trên SQL Server do không có DB.

## Cập nhật DB local — 2026-10-31

- Đã kết nối SQL Server localhost / EnglishCenterDB bằng Windows Authentication và bổ sung dbo.Users.TokenVersion int NOT NULL DEFAULT(0) theo yêu cầu người dùng.
- Kiểm tra sau thay đổi:5 User trước/sau, cả5 có TokenVersion=0. Không đổi email/hash/role; không chạy migration/seed hay mở API.
- Entity User, InitialCreate và snapshot đã có TokenVersion; đây là sửa schema drift của DB local, không tạo migration trùng cột và không sửa migration đã áp dụng.
- Script có guard database, transaction và kiểm tra cột để chạy lại: sql/2026-10-31-users-token-version.sql.
- Đây chưa phải xác nhận toàn schema tương thích: DB local vẫn thiếu các bảng phục vụ TeacherPortal. Cần đối chiếu đầy đủ trước khi bật luồng startup tự migrate/seed.

## Đã chạy Admin với DB thật — 2026-10-31

- BE5220 và FE5173 đã chạy với localhost/EnglishCenterDB; đăng nhập admin và các GET danh sách/chi tiết/summary đã thành công, bao gồm qua Vite proxy.
- Số liệu xác minh:1khóa/1lớp/2GV/2HV/0phiếu, KPI Studying2/OpenClasses1/Teachers2/Revenue0. Không thực hiện API mutation trong kiểm tra.
- Program mặc định không migrate/seed; Database:InitializeOnStartup=false khi chạy thử. Bản mock5174 đã dừng. Hướng dẫn FE-ADMIN.md.
- Các kết luận chưa chạy BE/DB trong mục cũ là lịch sử trước lần kết nối này. Chưa xác nhận toàn bộ schema TeacherPortal hay luồng ghi dữ liệu.
