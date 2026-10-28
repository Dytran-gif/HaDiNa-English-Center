---
name: implement
description: Đọc một file kế hoạch trong plans/, làm từng task theo thứ tự kèm kiểm tra sau mỗi task, chạy validation gate, rồi ghi báo cáo vào reports/<so>-<slug>-implementation.md.
disable-model-invocation: true
---

# /implement: Thực hiện kế hoạch

**Cách dùng:** `/implement plans/<so>-<slug>.md`

## Quy trình

### 1. Đọc hết kế hoạch trước khi viết code
Mở file `$ARGUMENTS`, đọc toàn bộ. Nạp các module `.claude/context/` ghi trong mục "Đọc trước khi làm".
Nếu plan còn là **backlog thô** (chưa có "Các task theo thứ tự") thì dừng lại và đề nghị chạy `/plan` trước.

### 2. Làm từng task theo thứ tự
Với mỗi task:
1. **Đọc** file đích trước khi sửa, không ghi đè mù.
2. **Làm** theo đúng file mẫu được chỉ ra trong plan.
3. **Chạy** lệnh `Kiểm tra:` của task ngay. Lỗi thì sửa xong mới sang task sau.
4. Đánh dấu `[x]` cho task trong file plan.

Luật trong lúc làm:
- Chỉ sửa trong vùng ghi ở plan. Phát sinh nhu cầu sửa file dùng chung hay file vùng khác thì **dừng lại hỏi người dùng**.
- Không cài thư viện mới.
- Đổi/thêm endpoint thì cập nhật `docs/api/*.md` ngay trong task đó.
- Thêm entity/field thì tạo migration (`dotnet ef migrations add <Ten>`) và **nhắc người dùng** là migration cần được commit.
- Thêm endpoint thì thêm request mẫu vào file `.http` của vùng.

### 3. Chạy validation gate
```
cd app/frontend && npm run lint
cd app/frontend && npm run typecheck
cd app/backend/EnglishCenter.Api && dotnet build
```
Chỉ cần chạy phần mình đã chạm (FE và/hoặc BE). Lệnh nào đỏ thì sửa, chạy lại lệnh đó, rồi chạy lại cả gate.
Nếu lỗi **có sẵn từ trước** và nằm ngoài vùng: không sửa, ghi vào báo cáo mục "Vấn đề".
Nếu máy không có `dotnet` thì ghi rõ "chưa build được BE" trong báo cáo, không được ghi PASS.

### 4. Ghi báo cáo `reports/<so>-<slug>-implementation.md`

```markdown
# Báo cáo thực hiện: <Tên việc>

Plan: `plans/<so>-<slug>.md` · Vùng: <...> · Người làm: <...> · Ngày: <yyyy-mm-dd>

## Task
| # | Task | Trạng thái | Ghi chú |
|---|------|-----------|---------|
| 1 | ... | XONG | |

## File thay đổi
- Tạo: `<path>`
- Sửa: `<path>`
- Migration: `<tên>` (cần commit) / không có

## Validation gate
| Lệnh | Kết quả |
|------|---------|
| `npm run lint` | PASS / FAIL / không chạy (không đổi FE) |
| `npm run typecheck` | ... |
| `dotnet build` | ... |

## Tiêu chí hoàn thành
- [x] ...

## Vấn đề / lệch so với plan
...

## Test tay cần làm
- [ ] (lấy theo checklist trong `.claude/context/testing.md`)
```

**Bước tiếp:** `/review`, rồi commit. Cuối buổi chạy `/handoff`.
