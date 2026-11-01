# Code Review — 20-be-admin-hoc-phi

**Kết luận:** CONCERNS — hai phần spec chờ DB đã được khoanh riêng; chưa có lỗi code chặn trong phạm vi schema hiện có.

Review tự thực hiện theo yêu cầu người dùng và checklist .claude/agents/code-reviewer.md, không dùng sub-agent.

## Phát hiện

- [CONCERN] `app/backend/EnglishCenter.Api/EnglishCenter.Api/Controllers/Admin/PaymentsController.cs:78` — Không tạo phiếu khi FinalTuitionFee <= 0 vì CK_Payments_Amount bắt buộc > 0, trong khi khóa học theo spec được Tuition = 0. Phần này ⏸ ở task 6.3.1; DB-CAN-LAM ghi yêu cầu chốt constraint/nghiệp vụ. Không sửa model/migration theo ràng buộc người dùng.
- [CONCERN] `app/backend/EnglishCenter.Api/EnglishCenter.Api/Controllers/Admin/PaymentsController.cs:47` — createdByName hiện dùng Email do admin không có trường họ tên. Chưa đáp ứng tên thật người lập ở 6.4.1; đánh ⏸ và ghi DB-CAN-LAM. API doc nói rõ fallback.
- [INFO] `app/backend/EnglishCenter.Api/EnglishCenter.Api/Dtos/Common/PagedResult.cs:7` — File dùng chung chỉ thêm Total alias; không bỏ TotalItems/TotalPages, đã ghi Ảnh hưởng vùng khác trong plan. Nhóm Teacher cần biết field JSON bổ sung này.
- [INFO] Validation DTO vẫn theo ProblemDetails hiện có; chuẩn hóa toàn cục B3.f thuộc đợt 5, chưa sửa Program.cs.
- [INFO] Chưa kiểm thử API/SQL Server thực tế. 24 kiểm tra tạm đã PASS; EF ToQueryString dịch được collation, projection và filter, không mở kết nối DB.

## Kiểm tra và sửa trong review

- Chia nhánh chọn ghi danh trước khi dựng LINQ, tránh truy cập nullable Value trong nhánh không dùng.
- POST trả 201 với Location rõ ràng, tránh sai tên action do MVC bỏ hậu tố Async khi tạo link.
- SQL unique 2601/2627 mới trả 409; không biến mọi DbUpdateException thành lỗi trùng phiếu.
- Phân trang dùng long khi tính skip, tránh tràn int với trang quá lớn.
- Total alias, auth admin, token creator, AppTime, DTO projection không lộ entity/hash, lịch sử Dropped, lớp Active/chưa kết thúc và giá snapshot đã đối chiếu.
- Không đổi hành vi endpoint cũ, không sửa entity/model/migration/FE/auth/CORS; API doc và .http có mọi endpoint mới.

## Tóm tắt

Code trong phạm vi schema hiện có đạt build và kiểm tra tạm. Giữ plan 20 đang làm do hai phần spec chờ DB; có thể tiếp tục Dashboard dùng các phiếu thu dương đã hỗ trợ. Chưa tuyên bố toàn bộ Page 6 hoàn thành hoặc đã test tích hợp.
