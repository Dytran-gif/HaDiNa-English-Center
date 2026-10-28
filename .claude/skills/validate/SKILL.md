---
name: validate
description: Chạy toàn bộ validation gate (FE oxlint + typecheck + build, BE dotnet build) và báo PASS/FAIL từng lệnh. Chạy trước mỗi commit hoặc PR.
disable-model-invocation: true
---

# /validate: Cổng kiểm tra

Hook Stop tự chạy gate này cho phần có thay đổi. Lệnh này chạy **đầy đủ** và báo kết quả rõ ràng.

## Lệnh

```bash
# Frontend
cd app/frontend && npm run lint
cd app/frontend && npm run typecheck
cd app/frontend && npm run build

# Backend
cd app/backend/EnglishCenter.Api && dotnet build
# (khi đã có project test — plan 90)
# cd app/backend/EnglishCenter.Api && dotnet test
```

Nếu `app/frontend/node_modules` chưa có thì chạy `npm install` trước.
Nếu `dotnet build` báo khóa file (MSB3027) thì dừng `dotnet run` đang chạy rồi build lại.

## Mẫu báo cáo

```
Validation Gate
===============
Frontend
  oxlint (npm run lint)      : PASS / FAIL
  tsc (npm run typecheck)    : PASS / FAIL (N lỗi)
  vite build (npm run build) : PASS / FAIL
Backend
  dotnet build               : PASS / FAIL (N lỗi) / KHÔNG CHẠY (không có dotnet)

Tổng: PASS / FAIL
```

Nếu **FAIL**: liệt kê từng lệnh lỗi kèm lỗi đầu tiên (file:dòng). Ghi rõ lỗi đó thuộc vùng nào (`ownership.md`) và là lỗi **mới** hay **có sẵn**.

Nếu **PASS**: sẵn sàng commit.
