# 📐 SƠ ĐỒ THIẾT KẾ HỆ THỐNG

> Các sơ đồ dưới đây viết bằng cú pháp **Mermaid**. Cách xem/vẽ ra hình thật:
> - **Cách 1 (khuyến nghị):** Vào https://mermaid.live → dán code bên dưới vào ô trái → hình sẽ hiện ra bên phải → bấm "Download PNG/SVG" để lưu ảnh, sau đó chèn ảnh vào Notion/báo cáo.
> - **Cách 2:** Nếu Notion của bạn đã cập nhật mới, gõ `/mermaid` trong Notion rồi dán code thẳng vào — Notion sẽ tự render thành hình.
> - **Cách 3:** Dùng draw.io (diagrams.net) để vẽ lại tay theo mô tả logic bên dưới nếu muốn tùy chỉnh giao diện.

---

## 1. User Tree (Sơ đồ phân quyền người dùng)

```mermaid
graph TD
    A[Website Trung tâm Tiếng Anh] --> B[Khách - chưa đăng nhập]
    A --> C[Học viên]
    A --> D[Giáo viên]
    A --> E[Admin]

    B --> B1[Xem trang chủ, danh sách khóa học]
    B --> B2[Làm bài test trình độ]
    B --> B3[Gửi form liên hệ / tư vấn]

    C --> C1[Đăng ký khóa học]
    C --> C2[Xem lịch học, tiến độ cá nhân]
    C --> C3[Thanh toán học phí]
    C --> C4[Đánh giá giáo viên / khóa học]

    D --> D1[Xem danh sách lớp phụ trách]
    D --> D2[Cập nhật thông tin cá nhân]

    E --> E1[Quản lý khóa học]
    E --> E2[Quản lý học viên / giáo viên]
    E --> E3[Quản lý tin tức / blog]
```

---

## 2. Activity Diagram — Luồng "Đăng ký khóa học"

```mermaid
flowchart TD
    Start([Bắt đầu]) --> A[Học viên xem danh sách khóa học]
    A --> B{Đã biết trình độ chưa?}
    B -- Chưa --> C[Làm bài test trình độ online]
    C --> D[Xem kết quả + gợi ý khóa học phù hợp]
    B -- Đã biết --> D
    D --> E[Chọn khóa học muốn đăng ký]
    E --> F{Đã có tài khoản?}
    F -- Chưa --> G[Đăng ký tài khoản mới]
    G --> H[Đăng nhập]
    F -- Đã có --> H[Đăng nhập]
    H --> I[Điền thông tin đăng ký khóa học]
    I --> J[Xác nhận thông tin]
    J --> K[Thanh toán học phí]
    K --> L{Thanh toán thành công?}
    L -- Không --> I
    L -- Có --> M[Hệ thống xác nhận đăng ký]
    M --> N[Học viên nhận thông tin lớp học qua email/tài khoản]
    N --> End([Kết thúc])
```

---

## 3. Activity Diagram — Luồng "Đăng nhập / Đăng ký tài khoản"

```mermaid
flowchart TD
    Start([Bắt đầu]) --> A[Người dùng vào trang Đăng nhập]
    A --> B{Đã có tài khoản?}
    B -- Chưa --> C[Nhấn Đăng ký]
    C --> D[Điền Họ tên, Email, Mật khẩu]
    D --> E{Thông tin hợp lệ?}
    E -- Không --> D
    E -- Có --> F[Tạo tài khoản thành công]
    F --> G[Chuyển sang trang Đăng nhập]
    B -- Có --> G
    G --> H[Nhập Email + Mật khẩu]
    H --> I{Đúng thông tin?}
    I -- Không --> H
    I -- Có --> J[Đăng nhập thành công, vào trang cá nhân]
    J --> End([Kết thúc])
```

---

## 4. ERD — Sơ đồ quan hệ thực thể

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : "đăng ký"
    COURSE ||--o{ ENROLLMENT : "được đăng ký"
    TEACHER ||--o{ COURSE : "phụ trách"
    CATEGORY ||--o{ COURSE : "thuộc danh mục"
    ENROLLMENT ||--|| PAYMENT : "có"
    USER ||--o{ REVIEW : "viết"
    TEACHER ||--o{ REVIEW : "được đánh giá"

    USER {
        int user_id PK
        string full_name
        string email
        string password
        string phone
        enum role
        datetime created_at
    }
    COURSE {
        int course_id PK
        string course_name
        text description
        int category_id FK
        int teacher_id FK
        decimal price
        int duration_weeks
        string level
    }
    CATEGORY {
        int category_id PK
        string category_name
    }
    TEACHER {
        int teacher_id PK
        string full_name
        text bio
        string avatar_url
        float rating_avg
    }
    ENROLLMENT {
        int enrollment_id PK
        int user_id FK
        int course_id FK
        date enroll_date
        string status
    }
    PAYMENT {
        int payment_id PK
        int enrollment_id FK
        decimal amount
        string payment_method
        datetime paid_at
        string status
    }
    REVIEW {
        int review_id PK
        int user_id FK
        int teacher_id FK
        int rating
        text comment
        datetime created_at
    }
```

### Bảng chi tiết từng entity (để đưa vào báo cáo)

**Bảng USER**

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
|---|---|---|---|
| 1 | user_id | INT (PK) | Mã định danh người dùng |
| 2 | full_name | VARCHAR(100) | Họ tên |
| 3 | email | VARCHAR(100) | Email đăng nhập, duy nhất |
| 4 | password | VARCHAR(255) | Mật khẩu đã mã hóa |
| 5 | phone | VARCHAR(15) | Số điện thoại |
| 6 | role | ENUM('student','teacher','admin') | Vai trò người dùng |
| 7 | created_at | DATETIME | Ngày tạo tài khoản |

**Bảng COURSE**

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
|---|---|---|---|
| 1 | course_id | INT (PK) | Mã khóa học |
| 2 | course_name | VARCHAR(150) | Tên khóa học |
| 3 | description | TEXT | Mô tả khóa học |
| 4 | category_id | INT (FK) | Danh mục khóa học |
| 5 | teacher_id | INT (FK) | Giáo viên phụ trách |
| 6 | price | DECIMAL(10,2) | Học phí |
| 7 | duration_weeks | INT | Thời lượng khóa học (tuần) |
| 8 | level | VARCHAR(50) | Trình độ (A1, B1, IELTS...) |

**Bảng ENROLLMENT**

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
|---|---|---|---|
| 1 | enrollment_id | INT (PK) | Mã đăng ký |
| 2 | user_id | INT (FK) | Học viên đăng ký |
| 3 | course_id | INT (FK) | Khóa học được đăng ký |
| 4 | enroll_date | DATE | Ngày đăng ký |
| 5 | status | VARCHAR(30) | Trạng thái (chờ duyệt/đã xác nhận/hủy) |

*(Bảng TEACHER, CATEGORY, PAYMENT, REVIEW làm tương tự — dựa theo cột đã liệt kê trong sơ đồ ERD ở trên)*

### Ghi chú chuẩn hóa (Normalization)

- Tách riêng bảng `CATEGORY` khỏi `COURSE` để tránh lặp lại tên danh mục ở mỗi dòng khóa học (đạt 2NF)
- Tách riêng bảng `PAYMENT` khỏi `ENROLLMENT` vì 1 lượt đăng ký có thể có thông tin thanh toán thay đổi (trạng thái, ngày trả) mà không ảnh hưởng dữ liệu đăng ký gốc
- `TEACHER` tách riêng khỏi `COURSE` vì 1 giáo viên có thể dạy nhiều khóa học — tránh lặp thông tin giáo viên (đạt 3NF)
