# 02 — Sửa lỗi typecheck có sẵn ở `student/Course`

- **Loại:** plan
- **Vùng:** Student
- **Người làm:** Nam
- **Phụ thuộc:** —
- **Độ khó:** Thấp

## Mục tiêu
`npm run typecheck` hiện **đỏ 6 lỗi** (lint xanh). Hook Stop sẽ chặn mọi phiên agent có sửa FE cho tới khi sửa xong, nên làm việc này **đầu tiên**.

```
src/pages/student/Course/Components/CourseBottom.tsx(1,1):  TS6133 'React' is declared but its value is never read.
src/pages/student/Course/Components/CourseMain.tsx(1,8):    TS6133 (như trên)
src/pages/student/Course/Components/CourseSidebar.tsx(1,1): TS6133 (như trên)
src/pages/student/Course/Course.tsx(1,8):                   TS6133 (như trên)
src/pages/student/Course/Course.tsx(6,29):                  TS2307 Cannot find module '../../../types/StudentTypes/CoursesTypes'
src/types/index.ts(22,5):                                   TS2305 '"./StudentTypes/HeaderTypes"' has no exported member 'PageTitle'
```

## Các task theo thứ tự

### Task 1: Bỏ `import React` không dùng
- [ ] 4 file trên: `import React, { useState } from "react"` đổi thành `import { useState } from "react"`. Dòng chỉ có `import React from 'react'` thì xóa.
- Kiểm tra: `npm run typecheck`, 4 lỗi TS6133 biến mất

### Task 2: Sửa đường dẫn type `Course`
- [ ] `Course.tsx` dòng 6: `CoursesTypes` không tồn tại. Type `Course` nằm ở `types/StudentTypes/MainTypes` (như `CourseBottom.tsx` đang import). Đổi thành `import type { Course } from "../../../types/StudentTypes/MainTypes";`
- Kiểm tra: `npm run typecheck`

### Task 3: `PageTitle` trong barrel
- [ ] `src/types/index.ts` dòng ~22 export `PageTitle` từ `./StudentTypes/HeaderTypes`, nhưng file đó không export. Tìm `PageTitle` được định nghĩa ở đâu (`grep -rn "PageTitle" src/types`). Nếu có thì sửa đường dẫn, nếu không có ai dùng thì bỏ khỏi barrel.
- Bẫy: `src/types/index.ts` là file dùng chung, nên báo nhóm (chỉ sửa đúng dòng Student).
- Kiểm tra: `npm run typecheck` hết lỗi

## Tiêu chí hoàn thành
- [ ] `npm run lint && npm run typecheck && npm run build` xanh
- [ ] Trang `/student/courses` vẫn hiển thị như cũ
