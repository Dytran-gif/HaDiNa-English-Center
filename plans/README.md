# Plans: danh sách việc cần làm

Mỗi việc là **một file**. File có hai dạng:
- **Backlog** (`Loại: backlog`): mới có mục tiêu, phạm vi và tiêu chí. Chạy `/plan plans/<file>.md` để agent đọc code và viết thành kế hoạch chi tiết, ghi đè chính file đó.
- **Kế hoạch** (`Loại: plan`): đã có task theo thứ tự kèm lệnh kiểm tra. Chạy `/implement plans/<file>.md`.

Mẫu file: [`_TEMPLATE.md`](./_TEMPLATE.md).

## Đánh số

| Dải số | Nhóm |
|---|---|
| `00–09` | Nền tảng chung: **làm trước**, chặn các việc khác |
| `10–19` | Student |
| `20–29` | Admin |
| `30–39` | Teacher |
| `40–49` | Public (trang chủ, khách) |
| `90–99` | Chất lượng, dọn dẹp, test (không chặn) |

Việc mới thì lấy số trống tiếp theo trong dải của vùng, ví dụ `16-be-student-xyz.md`. Tiền tố `be-` / `fe-` / `fs-` (full-stack) cho biết lớp.

## Bảng trạng thái

⬜ chưa bắt đầu · 🔵 đang làm · 🟡 chờ review · ✅ xong. Cập nhật bằng `/handoff`.

| # | Việc | Vùng | Người | Phụ thuộc | Trạng thái |
|---|---|---|---|---|---|
| 00 | [Tạo + commit migration `TeacherFeatures`](./00-be-migration-teacher-features.md) | Teacher | Duy | — | ⬜ |
| 01 | [Nền nối FE↔BE: CORS, `apiClient`, `.env`](./01-fs-nen-ket-noi-api.md) | Chung | ⟨chốt nhóm⟩ | — | ⬜ |
| 02 | [Sửa lỗi typecheck có sẵn ở `student/Course`](./02-fe-sua-typecheck-student.md) | Student | Nam | — | ⬜ |
| 03 | [Đăng nhập thật qua `POST /api/auth/login`](./03-fe-dang-nhap-that.md) | Chung | Hoàng | 01 | ⬜ |
| 10 | [BE Student: nền portal (`StudentControllerBase`) + dashboard + hồ sơ](./10-be-student-nen-portal.md) | Student | Nam | 00 | ⬜ |
| 11 | [BE Student: lịch học, đơn xin nghỉ/đổi buổi, đặt 1 kèm 1](./11-be-student-lich-va-yeu-cau.md) | Student | Nam | 10 | ⬜ |
| 12 | [BE Student: bài tập + nộp bài](./12-be-student-bai-tap-nop-bai.md) | Student | Nam | 10 | ⬜ |
| 13 | [BE Student: điểm, chuyên cần, nhận xét, đánh giá GV](./13-be-student-ket-qua-hoc-tap.md) | Student | Nam | 10 | ⬜ |
| 14 | [BE Student: học phí + thông báo](./14-be-student-hoc-phi-thong-bao.md) | Student | Nam | 10 | ⬜ |
| 15 | [FE Student: trang còn thiếu + nối API](./15-fe-student-trang-va-noi-api.md) | Student | Nam | 01, 03, 10–14 | ⬜ |
| 20 | [BE Admin: học phí / thanh toán](./20-be-admin-hoc-phi.md) | Admin | ⟨cần điền⟩ | — | ⬜ |
| 21 | [BE Admin: blog + ảnh trang chủ](./21-be-admin-blog-trang-chu.md) | Admin | ⟨cần điền⟩ | — | ⬜ |
| 22 | [BE Admin: dashboard + báo cáo](./22-be-admin-bao-cao.md) | Admin | ⟨cần điền⟩ | 20 | ⬜ |
| 23 | [FE Admin: trang còn thiếu + nối API](./23-fe-admin-trang-va-noi-api.md) | Admin | Duy | 01, 03, 20–22 | ⬜ |
| 30 | [FE Teacher: trang còn thiếu + nối API](./30-fe-teacher-trang-va-noi-api.md) | Teacher | Duy | 00, 01, 03 | ⬜ |
| 40 | [BE Public: khóa học, giáo viên, blog, thông tin trung tâm](./40-be-public-api.md) | Public | Hoàng | — | ⬜ |
| 41 | [FE Public: nối trang public vào API](./41-fe-public-noi-api.md) | Public | Hoàng | 01, 40 | ⬜ |
| 90 | [Project test xUnit cho service thuần](./90-be-project-test.md) | Chung | — | — | ⬜ |
| 91 | [Dọn dẹp file thừa / cấu hình trùng](./91-don-dep.md) | Chung | — | — | ⬜ |

## Thứ tự gợi ý

```
00 ─┬─> 10 ─> 11,12,13,14 ─┐
    └─> 30                  ├─> 15
01 ─> 03 ───────────────────┤
                            ├─> 23  (sau 20,21,22)
40 ─> 41 ───────────────────┘
02 làm ngay (để hook Stop không chặn)
```
