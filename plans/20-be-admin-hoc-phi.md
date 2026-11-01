# 20 — BE Admin: học phí / thanh toán

- **Loại:** plan
- **Vùng:** Admin
- **Người làm:** Codex
- **Độ khó:** Vừa

## Mục tiêu
Đợt 1 theo ADMIN-SPEC: danh sách/tìm phiếu, tạo phiếu đóng đủ một lần, biên lai, lịch sử học phí và lớp còn chỗ. Spec thay backlog CRUD cũ: không nhận amount từ client, không PUT/DELETE phiếu.

## Đọc trước khi làm
- CLAUDE.md, app/backend/CLAUDE.md; context backend/api-contract/auth/data-model/datetime/ownership/testing/architecture.
- ADMIN-SPEC.md:279, :305, :409–445; ADMIN_API.md; RoomsController.cs:12 (auth/lỗi), ClassesController.cs:43 (projection), :108 (phân trang), StudentsController.cs:68 (snapshot).
- Payment.cs:3, Enrollment.cs:3, User.cs:3; AppDbContext.cs:241 (Amount > 0); PagedResult.cs:3; EnglishCenter.Api.http:1.

## File ảnh hưởng
Tạo Controllers/Admin/PaymentsController.cs, AdminSearch.cs, AdminPaymentQueries.cs và Dtos/Admin/PaymentRequest.cs, PaymentResponse.cs, AvailableClassResponse.cs. Thêm action vào StudentsController.cs, ClassesController.cs. Cập nhật API doc, .http, tracker, DB-CAN-LAM, reports và bàn giao.

## Ảnh hưởng vùng khác
- Dtos/Common/PagedResult.cs: chỉ thêm Total => TotalItems; giữ field cũ cho Teacher.
- Không sửa Program.cs, Services, Public, frontend, auth, CORS, Entities, model, migrations hoặc NuGet.
- Helper tìm kiếm trong Controllers/Admin dựng expression chứa EF.Functions.Collate để tái dùng cho B3.c đợt 5.

## Quyết định và rủi ro
- Lớp còn chỗ = Upcoming/Ongoing (EndDate >= AppTime.Today); đếm Enrollment.Active; giá xem trước từ khóa hiện tại, làm tròn như EnrollmentService.
- POST nhận enrollmentId HOẶC studentId/classId. Method bắt buộc Cash/Transfer; PaidDate mặc định AppTime.Today, không tương lai.
- Transaction kiểm tra Active và lưu phiếu; unique EnrollmentId chặn tạo đồng thời, chỉ SQL 2601/2627 chuyển thành 409.
- Amount lấy snapshot FinalTuitionFee; <= 0 trả 400 do constraint DB (DB-CAN-LAM).
- Admin chưa có họ tên: createdByName tạm dùng Email (chờ DB). CenterSetting Id=1 chưa có thì biên lai trả 404.
- PaidDate DESC rồi Id DESC; page >= 1, pageSize 1–100; skip dùng long để trang rất lớn trả rỗng.
- Validation DTO vẫn ProblemDetails; B3.f ở đợt 5.

## Các task theo thứ tự
Mỗi task cập nhật API doc + .http, build xanh rồi cập nhật tracker ngay.

1. [x] GET payments (6.1.1, 6.2.1), DTO/projection, helper Vietnamese_CI_AI, Total alias. Mẫu RoomsController/ClassesController. Kiểm tra: `dotnet build`.
2. [x] POST payments (6.3.1): DTO, token, transaction, snapshot, Active, duplicate, ngày; ghi phần chờ DB. Kiểm tra: `dotnet build`.
3. [x] GET payments/{id} (6.4.1): trung tâm + snapshot + người lập; ghi giới hạn tên admin. Kiểm tra: `dotnet build`.
4. [x] GET students/{id}/payments (4.6.3): items + totalPaid, 404 HV không tồn tại. Kiểm tra: `dotnet build`.
5. [x] GET classes/available?search= (phần 4.5.1): tuition/discountPercent/finalTuition. Giữ 4.5.1 một phần vì thiếu route enrollments chuẩn. Kiểm tra: `dotnet build`.

## Validation gate và tiêu chí
- [x] `dotnet build` tại app/backend/EnglishCenter.Api sau mỗi task và cuối đợt, 0 lỗi.
- [x] `dotnet test` nếu có project test (hiện chưa có).
- [x] Tự review theo .claude/agents/code-reviewer.md theo yêu cầu người dùng; ghi implementation/review report.
- [x] API doc, .http, tracker, plans/README.md và bàn giao khớp code.
Không chạy API/DB; test tích hợp 401/403, duplicate đồng thời, collation khi SQL Server sẵn sàng.

## Kết quả đợt 1
5 task code hoàn tất theo schema hiện có; 6.3.1 và 6.4.1 chưa đạt toàn bộ spec do hai phần chờ DB. 24 kiểm tra tạm không cần DB đã PASS (DTO, JSON alias, EF ToQueryString, authorize, guard trước DB). Không có project test tự động trong repo nên không chạy dotnet test. Đợt tiếp theo: plan 22.
