# 20 — BE Admin: học phí / thanh toán

- **Loại:** backlog
- **Vùng:** Admin
- **Người làm:** ⟨cần điền⟩
- **Phụ thuộc:** —
- **Độ khó:** Vừa

## Mục tiêu
FE đã có `src/pages/admin/Payments/PaymentsManagement.tsx` (mock). BE có entity `Payment` (1 `Enrollment` – 0..1 `Payment`) nhưng **chưa có controller**.

## Phạm vi
- `Controllers/Admin/PaymentsController.cs` (`api/admin/payments`), mẫu `RoomsController.cs`:
  - `GET ?status=Paid|Unpaid&search=&classId=&page=&pageSize=`: danh sách ghi danh kèm số phải đóng / đã đóng (trả `PagedResult`)
  - `POST` với `{ enrollmentId, amount, method: Cash|Transfer, paidDate, note }` (409 nếu đã có Payment). `CreatedByUserId` lấy từ token.
  - `PUT /{id}`, `DELETE /{id}`
- `Dtos/Admin/PaymentRequest.cs`, `PaymentResponse.cs`
- Cập nhật `docs/api/ADMIN_API.md`

## Cần chốt
- Một ghi danh chỉ đóng **một lần** (theo schema hiện tại `Enrollment 1–0..1 Payment`). Nếu muốn đóng nhiều đợt thì phải đổi quan hệ + migration. Bàn nhóm trước.

## Tiêu chí hoàn thành
- [ ] CRUD chạy bằng `Admin.http`
- [ ] Student xem được trạng thái đóng ở plan 14
- [ ] `dotnet build` xanh
