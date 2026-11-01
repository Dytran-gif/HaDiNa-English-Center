# 27 — Rà soát và sửa kết nối Admin FE/BE

Ngày: 2026-10-31. Người dùng yêu cầu fullstack review và sửa lỗi trong ngữ cảnh Admin.

## Phạm vi

Controllers/Dtos Admin; DTO reset mật khẩu dùng chung chỉ Admin đang gọi; Components/Api, Dashboard, Reports, layout Admin; mock preview và các tài liệu hợp đồng. Không schema/migration, không xóa dữ liệu, không viết lại Teacher/Student/Public. Đọc CLAUDE, context frontend/backend/auth/api-contract/datetime/ownership, ADMIN_API, DB-CAN-LAM và audit trước.

## Các task theo thứ tự

- [x] 1. Sửa phân trang int overflow ở courses/teachers/students/classes, dùng AppTime; tìm kiếm qua AdminSearch CI_AI; validate status sai. Kiểm tra: dotnet build.
- [x] 2. Đồng bộ mật khẩu 8 ký tự, cấm đổi trùng mật khẩu cũ; nhận biết thiếu trường số khóa và trả field errors cho trùng tên/xóa báo số lớp. Kiểm tra: validation không DB và build.
- [x] 3. Form CRUD hiển thị errors theo field, giữ giá trị form dạng string, cho phép null ở payload các trường mô tả tùy chọn; số nguyên cho số buổi, preview học phí, nhắc snapshot. Kiểm tra: FE build/lint/typecheck.
- [x] 4. Thêm dashboard/kpis và dashboard/revenue-by-month từ DB; nối KPI/Reports qua service chung, không số mock/0 giả khi lỗi; giữ bỏ công nợ và xuất chi tiết. Mock preview mô phỏng hai endpoint. Kiểm tra: SQL translation không kết nối DB và HTTP preview.
- [x] 5. Validate, review bằng code-reviewer, API doc/.http, báo cáo và bàn giao. Giữ audit cũ làm lịch sử; ghi giới hạn chưa test SQL Server.

## Nghiệm thu

Không thêm dependency, không đổi schema. FE build/lint/typecheck, BE build, các kiểm tra phù hợp đạt. Lint warning cũ ghi riêng. Các quyết định nghiệp vụ chưa rõ và chức năng chưa triển khai không gọi là hoàn tất toàn repo.

## Ảnh hưởng vùng khác
AppTime trong SessionService dùng chung cả Teacher/Student: nay tính UTC+7 cố định thay giờ server; không đổi lịch/dữ liệu cũ. Program chỉ bỏ middleware HTTPS/authorization bị đăng ký lặp, giữ nguyên thứ tự AuthN/AuthZ. Không sửa AuthContext hay schema. Quy tắc lớp đang mở giữ EndDate>=today theo implementation có sẵn; các lựa chọn nghiệp vụ mới trong audit vẫn cần người dùng chốt.
