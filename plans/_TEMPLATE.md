# <NN> — <Tên việc>

- **Loại:** backlog | plan
- **Vùng:** Public | Admin | Teacher | Student | Chung
- **Người làm:** <tên>
- **Phụ thuộc:** <số plan> | —
- **Độ khó:** Thấp | Vừa | Cao

## Mục tiêu
<1–3 câu: làm xong thì người dùng / hệ thống có thêm gì>

## Phạm vi
- Trong phạm vi: ...
- Ngoài phạm vi: ...

## Đọc trước khi làm
- `.claude/context/<module>.md`
- `<path>` (dòng N–M): <vì sao>

## File ảnh hưởng
### Sửa
- `<path>`: <sửa gì>
### Tạo
- `<path>`: <để làm gì>
### Ảnh hưởng vùng khác / file dùng chung
- `<path>`: <thay đổi gì, báo ai>

## API (nếu có)
| Method | URL | Body | Response | Lỗi |
|---|---|---|---|---|

## Các task theo thứ tự
### Task 1: <động từ> <đối tượng>
- [ ] Làm gì: ...
- Mẫu: `<path>:L<dòng>` (bắt chước cái gì)
- Bẫy: ...
- Kiểm tra: `<lệnh chính xác>`

### Task 2: ...

## Validation gate
```
cd app/frontend && npm run lint && npm run typecheck
cd app/backend/EnglishCenter.Api && dotnet build
```

## Tiêu chí hoàn thành
- [ ] <tiêu chí đo được>
- [ ] `docs/api/*.md` khớp code
- [ ] Validation gate xanh
