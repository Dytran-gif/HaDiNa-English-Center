# Báo cáo thực hiện: 20 — BE Admin học phí

Plan: plans/20-be-admin-hoc-phi.md · Vùng: Admin · Người làm: Codex · Ngày: 2026-10-30

## Task

| # | Task | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | 6.1.1, 6.2.1: GET payments + tìm kiếm | XONG | Phân trang, total alias, snapshot, Vietnamese_CI_AI, PaidDate DESC/Id DESC. |
| 2 | 6.3.1: POST payments | CODE XONG THEO SCHEMA; ⏸ | Active, transaction, token, snapshot, duplicate 409. Phiếu miễn phí chờ DB. |
| 3 | 6.4.1: GET payments/{id} | CODE XONG THEO SCHEMA; ⏸ | CenterSetting + snapshot; người lập tạm dùng email, họ tên thật chờ DB. |
| 4 | 4.6.3: GET students/{id}/payments | XONG | items + totalPaid; lịch sử gồm phiếu của ghi danh Dropped. |
| 5 | Phần 4.5.1: GET classes/available | XONG PHẦN NÀY | Lớp Upcoming/Ongoing còn chỗ, giá hiện tại của khóa. Route ghi danh chuẩn chưa làm. |

## File thay đổi

- Tạo Controllers/Admin/PaymentsController.cs, AdminPaymentQueries.cs, AdminSearch.cs; Dtos/Admin/PaymentRequest.cs, PaymentResponse.cs, AvailableClassResponse.cs.
- Chỉ thêm action vào Controllers/Admin/StudentsController.cs và ClassesController.cs.
- Dùng chung: Dtos/Common/PagedResult.cs chỉ thêm Total => TotalItems; giữ API cũ cho Teacher.
- Cập nhật EnglishCenter.Api.http, docs/api/ADMIN_API.md, plans/20, plans/README.md, docs/BAN-GIAO.md.
- Tạo docs/admin/ADMIN-TRACKER.md (56 task, mỗi task một dòng) và DB-CAN-LAM.md; ADMIN-SPEC.md có sẵn do người dùng cung cấp, không sửa.
- Tạo implementation/review report này. Không migration, entity/model, auth/CORS, frontend, Program.cs, Services hoặc NuGet thay đổi.

## Validation gate

| Lệnh / kiểm tra | Kết quả |
|---|---|
| dotnet build (baseline) | PASS — 0 warning, 0 error |
| dotnet build sau từng task 1–5 | PASS cả 5 lần — 0 warning, 0 error |
| dotnet build (cuối đợt) | PASS — 0 warning, 0 error |
| dotnet test | Không chạy: repo chưa có project test |
| Harness console tạm trong TEMP | PASS 24 kiểm tra; không khởi động API/kết nối DB |
| So task spec với tracker | 56 mã task, 56 dòng, không thiếu/trùng |
| git diff --check | PASS |
| FE lint/typecheck/build | Không chạy: không đổi frontend |

Build trong sandbox ban đầu không đọc được NuGet.Config ở profile người dùng; chạy lại dotnet build với quyền ngoài sandbox đã PASS. Không đổi cấu hình NuGet để né sandbox.

Harness tạm: `dotnet run --project C:/Users/ADMIN/AppData/Local/Temp/hadina-admin-check-ecc637d5033a4e0cb4c9943e041fe4cf/Verify.csproj`. Không thêm project test/package vào repo. Kiểm tra 11 trường hợp DTO, không có Amount trong request, JSON total/totalItems, EF ToQueryString (payments, classes còn chỗ, lịch sử, truy vấn snapshot), authorize admin, guard claim/ngày trước khi truy cập DB. Có thể mất khi hệ thống dọn TEMP.

## Tiêu chí hoàn thành

- [x] Năm nhóm endpoint code xong theo schema hiện có, có doc/.http và build xanh.
- [x] Tự review theo .claude/agents/code-reviewer.md, ghi báo cáo riêng.
- [x] Tracker/plan/handoff ghi đúng các phần còn thiếu, không đánh xong toàn bộ spec cho 6.3.1/6.4.1.
- [ ] Toàn bộ spec 6.3.1/6.4.1: cần người phụ trách DB xử lý hai mục DB-CAN-LAM.
- [ ] Test API tích hợp với SQL Server.

## Vấn đề / lệch so với plan

Không thêm NuGet. Chốt POST nhận enrollmentId HOẶC studentId/classId; không cho gửi lẫn. PaidDate mặc định AppTime.Today. Giá thu dùng snapshot, giá lớp còn chỗ dùng khóa hiện tại; giữ cách làm tròn EnrollmentService. Biên lai khi thiếu CenterSetting trả 404 message, không dựng cấu hình giả.

AppTime hiện dùng giờ máy chủ; cần vận hành ở giờ Việt Nam. Validation DTO còn ProblemDetails như code cũ; B3.f chuẩn hóa ở đợt 5. ToQueryString chứng minh EF dịch query được, không chứng minh SQL Server thực thi/collation trả kết quả đúng.

## Test tay cần làm khi DB sẵn sàng

- [ ] Mọi endpoint: không token 401, token teacher/student 403.
- [ ] Tạo phiếu hợp lệ bằng cả hai cách; amount luôn snapshot dù client gửi giá khác hoặc giá khóa đã đổi.
- [ ] Ghi danh OnHold/Dropped, không tồn tại; method sai, selector thiếu/lẫn, note quá dài, ngày tương lai.
- [ ] Gửi hai POST cùng ghi danh đồng thời: đúng một phiếu, request trùng 409, không có ghi một phần.
- [ ] Tìm tên có/không dấu, hoa/thường, mã HV, ký tự wildcard; phân trang rỗng và thứ tự ngày/Id.
- [ ] Biên lai thiếu phiếu/cấu hình; đối chiếu giá gốc/giảm giá/số tiền/logo/email người lập.
- [ ] Lịch sử HV không tồn tại 404, chưa thu rỗng/tổng 0; ghi danh rút vẫn giữ lịch sử thu.
- [ ] Lớp đã kết thúc/đầy bị loại, Active tính đúng, lớp tương lai còn chỗ có mặt.

## Việc tiếp theo

Đợt 2 plan 22: KPI; hai chuỗi tháng liên tục có 0; lớp hôm nay và lớp sắp đầy. Sau đó Homepage (đợt 3), endpoint trang 3–5 (đợt 4), B3 còn lại (đợt 5). Không triển khai thêm đợt trong lần chạy này.
