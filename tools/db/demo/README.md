# Dữ liệu demo cổng Giáo viên

Tạo dữ liệu như một giáo viên đang dạy thật cho tài khoản **`teacher@demo.com` / `123456`**. Mọi ngày giờ đều **tính từ ngày chạy script**, nên chạy hôm nào thì dữ liệu cũng trông như đang diễn ra.

## Chạy

Điều kiện: DB đã áp đủ migration (`dotnet ef database update`), máy có `sqlcmd`.

```powershell
# thư mục gốc repo
powershell -ExecutionPolicy Bypass -File tools\db\demo\teacher-demo-data.ps1
```

Script sẽ:
1. Chép file demo vào `app/backend/.../wwwroot/uploads/demo/`. Thư mục này bị gitignore, nên **mỗi máy phải tự chạy**.
2. Chạy `teacher-demo-data.sql` trong **1 transaction**: lỗi thì rollback hết. Chỉ **thêm** dữ liệu, không sửa dữ liệu cũ (riêng hồ sơ `teacher@demo.com` được bổ sung bằng cấp, ngày vào làm; tên đổi từ "Nguyen Van A" sang "Nguyễn Văn An").
3. Chạy lần 2 sẽ tự bỏ qua, vì kiểm tra đã có học viên `HV2001`.

Muốn tạo lại từ đầu: khôi phục DB (`tools\db\restore-db.ps1 -Force` rồi `dotnet ef database update`, sau đó seed lại), hoặc xóa DB rồi `tools\db\teacher-features.ps1 -CreateFresh -SeedDemo`, rồi chạy lại script này.

## Có gì

| Loại | Số lượng | Ghi chú |
|---|---|---|
| Lớp | 5 | Lớp gốc IELTS 6.5 tối 2-4-6; **Foundation 5.5 tối 3-5-7** (đang dạy, nhiều dữ liệu nhất); **Writing 7.0 cuối tuần** (có buổi online); IELTS 6.5 sáng 3-5 (**sắp khai giảng**); Speaking 6.0 (**đã kết thúc**) |
| Khóa học | 3 mới | Foundation 5.5, Writing Intensive 7.0, Speaking Booster 6.0 |
| Học viên | 16 | `HV2001`–`HV2016`, email dạng `minhanh.le@demo.com`, mật khẩu giống `teacher@demo.com` |
| Buổi học | ~100 | Sinh đúng lịch tuần; buổi đã qua có gắn bài giáo án + nhật ký |
| Giáo án | 12 + 8 + 6 bài | Mỗi bài có mô tả, nội dung đã dạy, bài tập về nhà |
| Điểm danh | ~280 dòng | Có mặt / muộn (kèm ghi chú) / vắng / vắng có phép |
| Tài liệu | 15 | PDF, ảnh đề bài, audio, link (file thật trong `files/`) |
| Bài tập | 12 | Writing Task 1/2, Speaking, Quiz Reading/Listening; đã hết hạn, sắp hết hạn, giao riêng nhóm |
| Bài nộp | 64 | Bài viết thật theo band 4.5–7.0, ghi âm Speaking, Quiz tự chấm; đủ trạng thái chờ chấm / nháp / công bố / trả bài |
| Lỗi highlight | ~40 | Trên các bài Writing band thấp |
| Bài kiểm tra | 6 | Định kỳ, giữa kỳ, cuối kỳ, kèm điểm; trọng số cho 3 lớp |
| Nhận xét học viên | 13 | Hằng tháng, giữa khóa, cuối khóa (in được phiếu cuối khóa lớp Speaking) |
| Đề xuất lên lớp | 3 | |
| Đánh giá / phản hồi | 10 / 8 | Hiện ở trang Hồ sơ |
| Yêu cầu học viên | 11 | Xin nghỉ, đổi buổi, đặt 1 kèm 1 (5 đang chờ) |
| Lịch rảnh / 1 kèm 1 | 12 / 4 | |
| Thông báo | 5 thông báo lớp + 12 chuông của giáo viên | |

## Kịch bản demo gợi ý

1. **Dashboard**: có buổi chưa điểm danh (sắp khóa 48h), bài chờ chấm (có bài trễ hạn chấm 24h), học viên cần chú ý (HV2012 vắng 2 buổi liên tiếp, HV2015 chưa nộp nhiều bài, HV2011 band Writing giảm xuống 5.0), hạn nộp 7 ngày tới, yêu cầu chờ duyệt.
2. **Chấm bài**: mở bài *Writing Task 2 - Should university education be free?* của Trương Mỹ Duyên (bài thiếu số từ): highlight lỗi, chọn nhận xét mẫu, công bố. Châu Anh Thư có lịch sử 2 lần nộp (lần 1 bị trả bài).
3. **Speaking**: bài *Describe a place* của Lý Khánh Linh có ghi âm bài nói và ghi âm nhận xét của giáo viên.
4. **Lớp Foundation**: tab Học viên → Nhận xét; tab Bài tập → giao bài mới; tab Chuyên cần (HV2016 vắng > 20%).
5. **Yêu cầu**: duyệt đơn đặt lịch 1 kèm 1 của Phan Nhật Nam → buổi tự hiện trên Lịch dạy.
6. **Sổ điểm**: lớp Speaking 6.0 đã có đủ điểm giữa kỳ / cuối kỳ → xuất Excel, in phiếu cuối khóa.

## Sửa dữ liệu

Không sửa tay file `.sql` (sinh tự động). Sửa trong `generator/` (`gen_sql.py`: lớp, học viên, bài tập, điểm; `essays.py`: đề và bài viết), rồi chạy `python generator/gen_sql.py` để sinh lại file `.sql`.
