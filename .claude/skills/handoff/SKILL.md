---
name: handoff
description: Cuối buổi, ghi khối bàn giao (xong gì / đang dở / việc tiếp theo / bẫy) lên đầu docs/BAN-GIAO.md và cập nhật trạng thái trong plans/README.md, để người sau (hoặc buổi sau) làm tiếp được ngay.
disable-model-invocation: true
---

# /handoff: Bàn giao cuối buổi

**Cách dùng:** `/handoff` hoặc `/handoff <ghi chú thêm>`

## Quy trình

1. Xem trong buổi đã làm gì: `git status`, `git log --oneline -15`, các file mới trong `reports/`.
2. Mở `docs/BAN-GIAO.md`, thêm **một khối mới ngay dưới tiêu đề** (mới nhất ở trên):

```markdown
## [yyyy-mm-dd] <Tên người> — <Vùng>

**Đã xong**
- <việc> (plan `NN`, PR/commit `<hash>`)

**Đang dở**
- <việc>: <dừng ở đâu, file nào>

**Việc tiếp theo**
- <việc cụ thể, kèm file plan>

**Bẫy cần biết**
- <điều người sau dễ vấp>

**Cần người khác làm / chờ**
- <ai> cần <gì> (vd: tạo migration X, thêm route vào routes.tsx)
```

3. Cập nhật cột **Trạng thái** trong bảng ở `plans/README.md` (⬜ → 🔵 → 🟡 → ✅).
4. Nếu có endpoint mới, kiểm tra `docs/api/*.md` đã khớp code chưa. Chưa khớp thì ghi vào "Đang dở".
5. Nhắc người dùng commit và push (`docs/BAN-GIAO.md`, `plans/`, `reports/`).

Viết ngắn, gạch đầu dòng, cụ thể tới tên file. Không chép lại nội dung plan.
