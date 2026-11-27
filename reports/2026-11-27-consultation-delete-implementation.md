# Xóa yêu cầu tư vấn — 2026-11-27

- FE: thêm cột Thao tác với Button danger/trash, ConfirmDialog có tên người gửi, busy/error, toast thành công và reload danh sách. Dùng service Admin hiện có.
- BE: DELETE `/api/admin/consultations/{id:int}`, role admin; xóa đúng ID bằng ExecuteDeleteAsync, trả 204/404. Không đổi schema hoặc dữ liệu liên quan.
- Hợp đồng: `docs/api/PUBLIC-COURSE-CONSULTATION.md`; mẫu request `Consultations.http`.
- Validation: lint/typecheck/build FE PASS (2 cảnh báo Fast Refresh và cảnh báo bundle cũ); BE build PASS 0 warning/error sau khi dừng API đang khóa DLL, đã khởi động lại API5220 với AutoSetup=false.
- 7 kiểm tra API/DB PASS: tạo bản ghi QA, tìm đúng ID, anonymous401, student403, admin204, xóa lại404, list total0. Bản ghi QA đã xóa bằng API, không xóa yêu cầu thật.
- Lần tạo QA đầu bị validation từ chối do courseSlug rỗng; sửa dữ liệu test sang slug không rỗng, không sửa sản phẩm.
- Browser thao tác xác nhận chưa chạy trong lượt này; dùng ConfirmDialog chung đã có.
