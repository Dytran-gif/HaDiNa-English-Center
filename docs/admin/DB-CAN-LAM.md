# DB cần làm — Admin

Cập nhật: 2026-10-30. Không thay entity/model/migration trong đợt này.

| Bảng | Cột / ràng buộc | Lý do / việc người phụ trách DB cần làm | Task |
|---|---|---|---|
| Payments | Amount, CK_Payments_Amount (Amount > 0) | Spec cho phép Tuition = 0. Chốt cho phép phiếu 0 (constraint >= 0) hoặc đổi nghiệp vụ spec. POST hiện trả 400 cho amount <= 0. | 6.3.1 — ⏸ phần phiếu miễn phí |
| Users | Thiếu họ tên admin | User chỉ có Email, admin không có hồ sơ. Cần tên hiển thị/hồ sơ admin để in đúng tên người lập. Tạm dùng Email ở createdByName/createdByEmail. | 6.4.1 — ⏸ phần tên người lập |

Schema hiện có đủ cho phần Payments còn lại và classes/available. Collation ở query không cần migration; chưa kiểm chứng thực thi trên SQL Server do không có DB.
