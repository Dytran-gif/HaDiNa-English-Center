# 01 — Nền nối FE ↔ BE: CORS, `apiClient`, `.env`

- **Loại:** plan (cần **nhóm chốt** trước khi làm, xem Task 0)
- **Vùng:** Chung (file dùng chung cả FE lẫn BE)
- **Người làm:** ⟨chốt nhóm⟩
- **Phụ thuộc:** —
- **Độ khó:** Vừa

## Mục tiêu
Để mọi page FE gọi được API thật theo **một cách duy nhất**:
- BE cho phép origin `http://localhost:5173` (CORS).
- FE có `src/services/apiClient.ts` (dùng `fetch` có sẵn, **không thêm thư viện**): gắn token, chuẩn hóa lỗi, xử lý 401.
- URL backend lấy từ biến môi trường `VITE_API_URL`.

## Đọc trước khi làm
- `.claude/context/api-contract.md`, `.claude/context/auth.md`
- `app/backend/EnglishCenter.Api/EnglishCenter.Api/Program.cs` (chưa có `AddCors`; `UseHttpsRedirection` và `UseAuthorization` bị gọi 2 lần)
- `app/frontend/src/context/AuthContext.tsx`
- `docs/conventions/TECH-STACK.md` (mục "Chưa dùng: API client")

## File ảnh hưởng
### Sửa
- `app/backend/.../Program.cs`: thêm CORS, bỏ middleware gọi trùng
- `app/backend/.../appsettings.json`: thêm `"Cors": { "Origins": ["http://localhost:5173"] }`
- `docs/conventions/TECH-STACK.md`: ghi "API client: `fetch` + `src/services/apiClient.ts` (tự viết, không thư viện)"
### Tạo
- `app/frontend/.env.example`: `VITE_API_URL=http://localhost:5220`
- `app/frontend/src/services/apiClient.ts`
- `app/frontend/src/services/README.md` → thay bằng hướng dẫn thật (file giữ chỗ đã có)
### Ảnh hưởng vùng khác
- Tất cả: đây là file dùng chung. Mở PR riêng, cả nhóm duyệt.

## Các task theo thứ tự

### Task 0: Chốt nhóm
- [ ] Đồng ý dùng `fetch` + `apiClient` tự viết (không axios), lưu token trong `AuthContext` (localStorage).
- [ ] Cập nhật `docs/conventions/TECH-STACK.md`.

### Task 1: CORS ở backend
- [ ] `builder.Services.AddCors(o => o.AddPolicy("Frontend", p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));` với `origins` đọc từ `Cors:Origins`
- [ ] `app.UseCors("Frontend");` đặt **trước** `UseAuthentication()`
- [ ] Bỏ dòng `app.UseHttpsRedirection();` thứ hai và `app.UseAuthorization();` thứ hai
- Bẫy: profile `http` chạy cổng 5220. Nếu FE gọi `http://` mà `UseHttpsRedirection` redirect sang 7238 thì preflight hỏng. Khi dev, dùng đúng profile `https` hoặc chỉ bật redirect ngoài Development.
- Kiểm tra: `dotnet build` · gọi từ trình duyệt ở 5173 thấy header `Access-Control-Allow-Origin`

### Task 2: `apiClient.ts`
- [ ] Viết `request<T>(method, path, body?, opts?)`:
  - `baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5220"`
  - gắn `Authorization: Bearer <token>` nếu có. Body là `FormData` thì không set `Content-Type`.
  - `204` thì trả `undefined`. JSON thì `res.json()`.
  - lỗi thì ném `ApiError { status, message, fieldErrors? }`, đọc được cả `{ message }` lẫn ProblemDetails `{ errors }`
  - `401` thì gọi callback `onUnauthorized` (AuthContext đăng ký để logout)
- [ ] Export tiện ích `api.get/post/put/del` + `downloadBlob(path)` cho file Excel / phiếu in
- [ ] Token: đọc qua hàm `getToken()` do `AuthContext` cung cấp (không đọc localStorage rải rác)
- Kiểm tra: `npm run lint && npm run typecheck`

### Task 3: Biến môi trường
- [ ] `.env.example` + kiểm tra `.gitignore` của FE đã chặn `.env*.local` (đang chặn `*.local`)
- [ ] Thêm `/// <reference types="vite/client" />` nếu thiếu (đã có `vite-env.d.ts`)
- Kiểm tra: `npm run build`

### Task 4: Ví dụ mẫu đầu tiên
- [ ] `src/services/admin/rooms.ts` với `getRooms()`, `createRoom()`, `updateRoom()`, `deleteRoom()` theo `docs/api/ADMIN_API.md`, có hàm map sang type `Room` của FE
- [ ] **Chưa** sửa page (để chủ vùng Admin làm ở plan 23). Đây chỉ là mẫu cho các bạn chép theo.
- Kiểm tra: `npm run typecheck`

## Tiêu chí hoàn thành
- [ ] FE ở 5173 gọi `GET /api/admin/rooms` (đăng nhập admin) không bị CORS chặn
- [ ] `apiClient` chuẩn hóa được cả 2 dạng lỗi
- [ ] Có 1 service mẫu `admin/rooms.ts`
- [ ] TECH-STACK.md cập nhật
- [ ] Validation gate xanh
