# 22 — BE Admin: dashboard + báo cáo

- **Loại:** backlog
- **Vùng:** Admin
- **Người làm:** ⟨cần điền⟩
- **Phụ thuộc:** 20 (doanh thu)
- **Độ khó:** Vừa

## Phạm vi
- `GET /api/admin/dashboard`: số học viên đang học, số GV, số lớp đang mở, doanh thu tháng, đơn GV chờ duyệt, lớp sắp khai giảng.
- `GET /api/admin/reports/revenue?from=&to=&groupBy=month`, `GET /api/admin/reports/enrollments?from=&to=`, `GET /api/admin/reports/attendance?classId=`
- `GET /api/admin/reports/*/export`: Excel, tái dùng `XlsxWriter.Build`
- Logic gom số đặt trong `Services/ReportService.cs` (mới) cho controller gọn.
- Cập nhật `docs/api/ADMIN_API.md`.

## Tiêu chí hoàn thành
- [ ] FE `admin/Dashboard` và `admin/Reports` có đủ số liệu cần hiển thị (đối chiếu mock hiện tại)
- [ ] `dotnet build` xanh

## Cập nhật 2026-10-31 — phạm vi đã làm ở plan27

Đã có GET dashboard/kpis và dashboard/revenue-by-month, FE Dashboard/Reports sử dụng trực tiếp. Chưa có toàn bộ nhóm reports mở rộng trong backlog này. Xuất chi tiết/công nợ/đơn giáo viên đã bị người dùng loại khỏi Admin; không triển khai lại các mục đó theo backlog cũ. Xem plan27, ADMIN_API và báo cáo thực hiện.
