# 📝 XÁC ĐỊNH VẤN ĐỀ (PROBLEM STATEMENT)
### Đồ án: Website Front-end Trung tâm Tiếng Anh

---

## 1. Bối cảnh

Tại Việt Nam, các trung tâm Anh ngữ hiện nay đã đầu tư khá mạnh vào website (ILA, Wall Street English, Apax Leaders...), nhưng phần lớn website của các trung tâm **quy mô vừa và nhỏ** vẫn còn dừng ở mức "trang giới thiệu tĩnh": chỉ có thông tin khóa học, số điện thoại liên hệ, và một form đăng ký tư vấn đơn giản. Toàn bộ quy trình sau đó — tư vấn, xếp lớp, đăng ký, theo dõi lịch học — vẫn xử lý thủ công qua điện thoại/Zalo/Facebook.

Trong khi đó, học viên ngày nay có xu hướng muốn **tự tìm hiểu, tự kiểm tra trình độ, tự đăng ký online** trước khi quyết định đến trung tâm, tương tự cách các hệ thống lớn (ILA, Wall Street English) đang vận hành.

## 2. Vấn đề cụ thể

Từ khảo sát thực tế và trải nghiệm cá nhân, nhóm nhận thấy các vấn đề sau ở nhiều website trung tâm tiếng Anh quy mô vừa/nhỏ:

**Vấn đề 1 — Học viên khó tự đánh giá trình độ và chọn đúng khóa học**
Phần lớn website chỉ liệt kê danh sách khóa học theo tên (Sơ cấp, Trung cấp, Giao tiếp...) mà không có công cụ giúp học viên tự xác định mình đang ở trình độ nào, dẫn đến học viên phải gọi điện/nhắn tin hỏi tư vấn viên, mất thời gian cho cả hai bên.

**Vấn đề 2 — Không có kênh tự đăng ký và theo dõi khóa học trực tuyến**
Học viên muốn đăng ký khóa học thường phải điền form liên hệ rồi chờ nhân viên gọi lại, thay vì được đăng ký và xem thông tin lớp học (lịch học, giáo viên, phòng học) ngay trên web như một tài khoản cá nhân.

**Vấn đề 3 — Thiếu kênh thông tin minh bạch về giáo viên và lịch học**
Học viên và phụ huynh không có cách nào xem trước thông tin giáo viên phụ trách, đánh giá từ học viên cũ, hay lịch học cụ thể trước khi quyết định đăng ký — điều mà các trung tâm lớn (như Wall Street English với hệ thống test trình độ và tư vấn lộ trình cá nhân hóa) đã làm khá tốt.

**Vấn đề 4 — Trải nghiệm không đồng nhất trên di động**
Nhiều học viên tiếp cận trung tâm qua điện thoại (qua quảng cáo Facebook/Google), nhưng giao diện website của các trung tâm nhỏ thường không tối ưu cho di động, gây trải nghiệm kém và tỷ lệ rời trang cao.

## 3. Hậu quả nếu không giải quyết

- Trung tâm mất khách hàng tiềm năng do quy trình tư vấn/đăng ký chậm, thủ công
- Nhân viên tư vấn quá tải vì phải trả lời các câu hỏi lặp lại (trình độ, lịch học, học phí)
- Học viên trải nghiệm rời rạc: tìm hiểu trên web, nhưng đăng ký và theo dõi lại qua kênh khác (điện thoại, Zalo)
- Trung tâm khó xây dựng hình ảnh chuyên nghiệp, hiện đại so với các hệ thống lớn

## 4. Mục tiêu của đồ án

Xây dựng một **website front-end cho trung tâm tiếng Anh** nhằm:

1. Cho phép học viên tự tìm hiểu, so sánh và lựa chọn khóa học phù hợp
2. Cung cấp **bài test trình độ đầu vào đơn giản** để định hướng khóa học (tính năng mới, học hỏi từ Wall Street English nhưng làm gọn hơn, phù hợp quy mô đồ án)
3. Cho phép đăng ký khóa học và xem thông tin cá nhân (lịch học, tiến độ) ngay trên web
4. Hiển thị minh bạch thông tin giáo viên, đánh giá từ học viên
5. Đảm bảo giao diện responsive, thân thiện trên cả di động và desktop

## 5. Đối tượng hưởng lợi

| Đối tượng | Lợi ích |
|---|---|
| Học viên / Phụ huynh | Tự tìm hiểu, kiểm tra trình độ, đăng ký nhanh, theo dõi lịch học minh bạch |
| Giáo viên | Quản lý lớp phụ trách, cập nhật thông tin cá nhân dễ dàng |
| Trung tâm (Admin) | Giảm tải tư vấn thủ công, quảng bá khóa học hiệu quả hơn, quản lý dữ liệu tập trung |

## 6. Phạm vi đồ án (Scope)

Vì đây là đồ án môn học kỳ, nhóm giới hạn phạm vi ở phần **front-end**: xây dựng giao diện đầy đủ chức năng với dữ liệu mẫu (mock data), chưa triển khai backend/server thật, phù hợp với yêu cầu môn học.

