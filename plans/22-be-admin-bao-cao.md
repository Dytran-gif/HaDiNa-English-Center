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
