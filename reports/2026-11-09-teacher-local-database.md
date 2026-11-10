# Kiểm tra code và cập nhật DB Teacher — 2026-11-09

- Fetch GitHub thành công; main local khớp origin/main tại 700e53f, có merge Teacher-Module PR #5.
- SQL Server localhost / EnglishCenterDB trước cập nhật: chỉ ghi nhận InitialCreate, chưa có bảng Teacher.
- Backup COPY_ONLY + CHECKSUM trước cập nhật; RESTORE VERIFYONLY thành công.
- Backup: `F:\sql server\install\MSSQL17.MSSQLSERVER\MSSQL\Backup\EnglishCenterDB_before_teacher_20261109.bak`.
- Sinh SQL từ migration EF đã có, kiểm tra chỉ thêm bảng/cột/index rồi áp dụng thành công:
  - 20261102164417_TeacherFeatures
  - 20261108140000_StudentFeedbackAndSubmissionFile
- Sau cập nhật: 35 bảng ứng dụng, 3 dòng migration; DBCC CHECKCONSTRAINTS không báo vi phạm.
- Dữ liệu trước/sau giữ nguyên: Users 6, Classes 2, Students 2, Payments 1.
- dotnet build --no-restore: PASS, 0 warning/error. EF has-pending-model-changes: No changes.
- Không restore đè DB, không chạy seed demo hoặc đổi mật khẩu/tài khoản. Script dữ liệu demo Teacher đã có trong tools/db/demo nhưng chưa áp dụng.
- Chưa kiểm tra toàn bộ giao diện Teacher với phiên đăng nhập thật; cập nhật schema không đồng nghĩa dữ liệu trên máy người khác đã được sao chép.
