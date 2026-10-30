# ADMIN SPEC (nguồn sự thật cho phần Admin)

> Chuyển từ Document_admin_final.docx. Đặt tại `docs/admin/ADMIN-SPEC.md`. Mã task (1.1, 2.3.1, 6.3.1…) dùng làm khóa trong `docs/admin/ADMIN-TRACKER.md`.

**Pages 1: DashBoard**

**1.1 3 nút lối tắt**

**What:** + Thêm học viên, + Tạo lớp, + Tạo phiếu thu.

**BE expected:** Không cần API riêng (dùng API tạo của các page tương ứng).

**FE expected:** Bấm nút điều hướng đến đúng page và **mở sẵn form tạo** (vd. /admin/students?action=create). Page đích đọc query param để mở modal/form

	### 1.2 Hiển thị 4 KPI card

**What:** 4 thẻ số liệu: học viên đang học, lớp đang mở, giáo viên, doanh thu tháng này.

**BE expected:** GET /api/admin/dashboard/kpis trả { activeStudents, openClasses, teachers, monthlyRevenue }. Học viên đang học = trạng thái "đang học"; lớp đang mở = trạng thái "đang học" (hoặc sắp mở, thống nhất với nhóm); doanh thu tháng = tổng số tiền (Amount) của các phiếu thu có ngày thu trong tháng hiện tại. Mỗi phiếu thu là một lần đóng đủ học phí sau giảm giá, nên không có khoản nợ hay khoản đóng dở.

**FE expected:** 4 card ngang hàng, có icon, số được format (doanh thu có dấu phân cách và đơn vị VNĐ). Skeleton khi đang tải; lỗi thì hiện toast và card rỗng "--".

	### 1.3 Biểu đồ doanh thu theo tháng

**What:** Doanh thu mỗi tháng, hiển thị dạng biểu đồ.

**BE expected:** GET /api/admin/dashboard/revenue-by-month?months=12 trả { month, revenue }; revenue = tổng Amount của các phiếu thu theo tháng của ngày thu. Tháng không có phiếu thu trả 0 để biểu đồ không bị đứt.

**FE expected:** Biểu đồ cột hoặc đường theo tháng, trục tiền có dấu phân cách và đơn vị VNĐ. Skeleton khi đang tải; lỗi thì hiện toast và khung biểu đồ rỗng.

### 1.4 – Biểu đồ học viên mới theo tháng

What: Số học viên mới đăng ký mỗi tháng.

BE expected: GET /api/admin/dashboard/new-students-by-month?months=12 trả { month, count }, đếm theo ngày tạo học viên.

FE expected: Biểu đồ cùng style với biểu đồ doanh thu, xếp cạnh nhau trên desktop, xếp dọc trên mobile.

### 1.5 – Khối lớp học hôm nay

### 1.5.1 – Danh sách lớp có lịch dạy trong ngày

What: Liệt kê các lớp có buổi học hôm nay: giờ, lớp, giáo viên, phòng, sĩ số

BE expected: GET /api/admin/dashboard/today-classes dựa trên bảng ClassSchedules (thứ trong tuần = hôm nay) và lớp nằm trong khoảng ngày bắt đầu – kết thúc. Trả { classId, className, startTime, endTime, teacherName, room, enrolled, capacity }, sắp xếp theo giờ bắt đầu. Không cần tính trạng thái theo giờ.

FE expected: Bảng/list theo giờ, sĩ số dạng 12/20. Bấm vào dòng để điều hướng sang trang chi tiết lớp (/admin/classes/:id).

### 1.5.2 – Tóm tắt trong ngày

What: Dòng tóm tắt, ví dụ: "Hôm nay có 6 lớp".

BE expected: Trả kèm trong response của 1.5.1: { totalToday }.

FE expected: Hiển thị ở tiêu đề khối; lấy từ dữ liệu đã tải, không gọi API riêng.

### 1.6 Bảng “Lớp sắp đầy”

### 1.6.1 – Bảng lớp sắp đầy

What: Lớp có sĩ số gần đạt tối đa.

BE expected: GET /api/admin/dashboard/almost-full-classes?threshold=0.8&limit=5 trả các lớp có enrolled/capacity >= threshold và chưa đầy hoặc vừa đầy, đang mở.

FE expected: Bảng nhỏ gồm tên lớp, sĩ số 18/20, thanh tiến độ; bấm mở chi tiết lớp.

**PAGE 2 Khóa học**

### Feature 2.1 – Danh sách khóa học dạng card

### Task 2.1.1 – Hiển thị lưới card, 4 card mỗi hàng

- What: Mỗi khóa là một card gồm: tên khóa, band (ví dụ "Band 5.5 - 6.0"), tổng số buổi (ví dụ "Tổng 30 buổi"), số học viên hiện tại trên tối đa (ví dụ 18/20), số buổi mỗi tuần (ví dụ "3 buổi/tuần").

- BE expected: GET /api/admin/courses?page=1&pageSize=16 trả { items: [{ id, name, bandFrom, bandTo, totalSessions, sessionsPerWeek, tuition, discountPercent, currentStudents, maxStudents }], total, page, pageSize }. Mặc định sắp xếp theo tên hoặc ngày tạo (chốt với nhóm). Dữ liệu band lưu thành hai trường bandFrom và bandTo. currentStudents = số học viên đang học các lớp của khóa; maxStudents = tổng sĩ số tối đa của các lớp đang mở thuộc khóa. Cả hai do BE tính, không thêm trường mới vào bảng khóa học. Có thể trả thêm finalTuition (học phí sau giảm) để FE hiển thị, tính từ tuition và discountPercent.

- FE expected: Lưới 4 cột trên desktop, 2 cột trên màn hình nhỏ. Số học viên hiển thị dạng 18/20 (hiện tại/tối đa) kèm icon người. Band hiển thị dạng "Band X - Y". Khóa có discountPercent > 0 thì hiện badge "Giảm X%" trên card. Có loading (skeleton card) và trạng thái "chưa có dữ liệu". Bấm vào card mở chi tiết/sửa khóa (xem 2.4).

### Task 2.1.2 – Phân trang, 16 khóa mỗi trang

- What: Mỗi trang hiển thị tối đa 16 khóa (4 hàng x 4 card). Đủ 16 khóa thì khóa tiếp theo sang trang khác.

- BE expected: pageSize mặc định 16; trả total để FE tính số trang. Trang vượt quá số trang hiện có trả danh sách rỗng, không báo lỗi.

- FE expected: Thanh phân trang dưới lưới card (trước/sau, số trang). Ẩn thanh phân trang khi tổng số khóa không quá 16. Đổi trang thì cuộn lên đầu danh sách, trang hiện tại lưu trên URL query.

### Feature 2.2 – Tìm kiếm khóa học

### Task 2.2.1 – Ô tìm kiếm theo tên khóa

- What: Một ô tìm kiếm ở đầu page để tìm khóa theo tên.

- BE expected: Tham số search trên API 2.1.1, khớp chứa, không phân biệt hoa thường và dấu. Kết hợp được với phân trang; total tính theo kết quả đã lọc.

- FE expected: Debounce khoảng 300ms trước khi gọi API. Đổi từ khóa thì về trang 1. Có nút xóa nhanh từ khóa. Không có kết quả thì hiện "Không tìm thấy khóa học phù hợp".

### Feature 2.3 – Thêm khóa học

### Task 2.3.1 – Form thêm khóa học

- What: Nhập: tên khóa *, band từ *, band đến *, tổng số buổi *, số buổi mỗi tuần *, học phí gốc *, phần trăm giảm giá (mặc định 0), mô tả.

- BE expected: POST /api/admin/courses. Validate: các trường có dấu * bắt buộc; band trong khoảng 0 đến 9, bước 0.5, và bandFrom ≤ bandTo; tổng số buổi là số nguyên dương; số buổi mỗi tuần từ 1 đến 7 và không lớn hơn tổng số buổi; học phí ≥ 0; discountPercent từ 0 đến 50 (mặc định 0, tối đa 50%); tên khóa không trùng. Lỗi trả 400/409 kèm lỗi theo từng trường.

- FE expected: Modal/form có validate phía client và hiển thị lỗi theo từng trường (kể cả lỗi từ BE). Hai ô band chọn từ danh sách 0 đến 9 bước 0.5. Thời lượng mỗi buổi không nhập ở khóa học mà lấy từ giờ bắt đầu và giờ kết thúc trong lịch học của từng lớp (xem 5.2.2). Ô giảm giá nhập số từ 0 đến 50 (vượt 50 thì báo lỗi), bên cạnh hiện xem trước học phí sau giảm (vd. học phí 5.000.000 VNĐ, giảm 20% thì hiện 4.000.000 VNĐ). Nút Lưu bị khóa khi đang gửi. Thành công thì đóng form, toast và tải lại danh sách.

### Feature 2.4 – Sửa và xóa khóa học

### Task 2.4.1 – Sửa khóa học

- What: Cập nhật thông tin một khóa.

- BE expected: PUT /api/admin/courses/{id} với cùng quy tắc validate như 2.3.1, gồm cả tuition và discountPercent. 404 nếu khóa không tồn tại. Thay đổi học phí hoặc giảm giá chỉ áp dụng cho các lần ghi danh mới; các ghi danh đã có giữ nguyên giá đã lưu lúc ghi danh (xem 4.5.1). Cần chốt: đổi tổng số buổi hoặc số buổi mỗi tuần khi khóa đã có lớp thì có ảnh hưởng đến lớp cũ không.

- FE expected: Dùng lại form thêm, điền sẵn dữ liệu của khóa đang chọn. Khi đổi học phí hoặc giảm giá, hiện dòng nhắc "Chỉ áp dụng cho học viên ghi danh từ bây giờ".

### Task 2.4.2 – Xóa khóa học

- What: Xóa một khóa khỏi hệ thống.

- BE expected: DELETE /api/admin/courses/{id}. Chặn xóa nếu khóa đang có lớp (409, message nêu rõ lý do và số lớp đang dùng khóa này).

- FE expected: Hộp thoại xác nhận trước khi xóa. Khi bị chặn thì hiện message lý do. Thành công thì toast và tải lại danh sách; nếu trang hiện tại hết khóa thì lùi về trang trước.

**PAGE 3 Giáo viên**

### Feature 3.1 – Danh sách giáo viên

### Task 3.1.1 – Bảng danh sách giáo viên có phân trang

- What: Bảng giáo viên gồm: tên, SĐT, chuyên môn, trạng thái, số lớp phụ trách. Cuối mỗi dòng có các nút thao tác: sửa, đặt lại mật khẩu, khóa/mở tài khoản, xóa.

- BE expected: GET /api/admin/teachers?page=1&pageSize=10 trả { items: [{ id, fullName, phone, specialty, status, classCount, isAccountLocked }], total, page, pageSize }. classCount là số lớp đang phụ trách, do BE tính. Trang vượt quá số trang hiện có trả danh sách rỗng, không báo lỗi.

- FE expected: Bảng có phân trang (trước/sau, số trang, tổng bản ghi). Badge màu cho trạng thái (Đang dạy / Tạm nghỉ). Có loading (skeleton) và trạng thái "chưa có dữ liệu". Bấm vào tên giáo viên mở trang chi tiết (xem Feature 3.5).

### Feature 3.2 – Tìm kiếm và lọc

### Task 3.2.1 – Ô tìm kiếm theo tên

- What: Một ô tìm kiếm ở đầu page để tìm giáo viên theo tên.

- BE expected: Tham số search trên API 3.1.1, khớp chứa, không phân biệt hoa thường và dấu. Kết hợp được với phân trang và bộ lọc; total tính theo kết quả đã lọc.

- FE expected: Debounce khoảng 300ms trước khi gọi API. Đổi từ khóa thì về trang 1. Có nút xóa nhanh từ khóa. Không có kết quả thì hiện "Không tìm thấy giáo viên phù hợp".

### Task 3.2.2 – Lọc theo chuyên môn và trạng thái

- What: Hai dropdown lọc: chuyên môn (ví dụ IELTS, TOEIC, Giao tiếp) và trạng thái (Đang dạy / Tạm nghỉ).

- BE expected: Tham số specialty và status trên API 3.1.1; status không hợp lệ trả 400. GET /api/admin/teachers/specialties trả danh sách chuyên môn hiện có để FE đổ dropdown.

- FE expected: Dropdown có lựa chọn "Tất cả". Giữ bộ lọc trên URL query để tải lại trang không mất. Đổi bộ lọc thì về trang 1.

### Feature 3.3 – Thêm giáo viên (kèm tạo tài khoản)

### Task 3.3.1 – Form thêm giáo viên

- What: Nhập: họ tên *, SĐT *, email *, chuyên môn *, bằng cấp, ngày vào làm, trạng thái, mật khẩu tạm * (dùng để tạo tài khoản đăng nhập role teacher).

- BE expected: POST /api/admin/teachers. Trong một transaction: tạo user (role teacher, băm mật khẩu tạm) và tạo hồ sơ giáo viên. Validate: các trường có dấu * bắt buộc; email đúng định dạng và không trùng (kể cả với tài khoản student/admin); SĐT hợp lệ; mật khẩu tối thiểu 8 ký tự. Lỗi trả 400/409 kèm lỗi theo từng trường. Không trả mật khẩu trong response.

- FE expected: Modal/form có validate phía client và hiển thị lỗi theo từng trường (kể cả lỗi từ BE như trùng email). Nút Lưu bị khóa khi đang gửi. Thành công thì đóng form, toast và tải lại danh sách.

### Feature 3.4 – Sửa và xóa giáo viên

### Task 3.4.1 – Sửa giáo viên

- What: Cập nhật hồ sơ giáo viên.

- BE expected: PUT /api/admin/teachers/{id} với cùng quy tắc validate như 3.3.1. Cho phép đổi email (vẫn kiểm tra trùng và đồng bộ sang tài khoản đăng nhập). Không đổi mật khẩu ở API này. 404 nếu giáo viên không tồn tại.

- FE expected: Dùng lại form thêm, điền sẵn dữ liệu của giáo viên đang chọn, ẩn ô mật khẩu tạm.

### Task 3.4.2 – Xóa giáo viên

- What: Xóa một giáo viên khỏi hệ thống.

- BE expected: DELETE /api/admin/teachers/{id}. **Chặn xóa nếu giáo viên đang phụ trách lớp** (409, message nêu rõ lý do và số lớp đang phụ trách); khi đó gợi ý chuyển trạng thái sang "Tạm nghỉ". Nếu xóa được thì xóa luôn tài khoản đăng nhập liên quan.

- FE expected: Hộp thoại xác nhận trước khi xóa. Khi bị chặn thì hiện message lý do. Thành công thì toast và tải lại danh sách; nếu trang hiện tại hết dòng thì lùi về trang trước.

### Feature 3.5 – Trang chi tiết giáo viên

### Task 3.5.1 – Hồ sơ và bằng cấp

- What: Xem đầy đủ thông tin một giáo viên: họ tên, SĐT, email, chuyên môn, bằng cấp, ngày vào làm, trạng thái và trạng thái tài khoản (đang mở hay đã khóa).

- BE expected: GET /api/admin/teachers/{id} trả toàn bộ hồ sơ và trạng thái tài khoản. 404 nếu không tồn tại.

- FE expected: Trang /admin/teachers/:id. Nút Sửa mở form như 3.4.1; nút quay lại giữ nguyên bộ lọc và trang của danh sách.

### Task 3.5.2 – Danh sách lớp phụ trách

- What: Liệt kê các lớp giáo viên này phụ trách (đang dạy và đã kết thúc).

- BE expected: GET /api/admin/teachers/{id}/classes trả { classId, className, courseName, schedule, startDate, endDate, enrolled, capacity, status }; status gồm sắp mở / đang học / đã kết thúc.

- FE expected: Bảng lớp trong trang chi tiết, có lọc theo trạng thái, sĩ số dạng 12/20. Bấm vào dòng để mở chi tiết lớp (/admin/classes/:id).

### Feature 3.6 – Quản lý tài khoản giáo viên

### Task 3.6.1 – Đặt lại mật khẩu

- What: Admin đặt lại mật khẩu cho giáo viên quên mật khẩu.

- BE expected: POST /api/admin/teachers/{id}/reset-password với { newPassword } (tối thiểu 8 ký tự). Băm mật khẩu, thu hồi phiên/token cũ nếu có.

- FE expected: Modal nhập mật khẩu mới (có nút hiện/ẩn), thông báo thành công và nhắc admin gửi mật khẩu cho giáo viên.

### Task 3.6.2 – Khóa / Mở tài khoản

- What: Chặn hoặc cho phép giáo viên đăng nhập.

- BE expected: POST /api/admin/teachers/{id}/lock và /unlock (hoặc một endpoint có cờ). Tài khoản bị khóa không đăng nhập được và trả message rõ ràng; token đang dùng bị vô hiệu.

- FE expected: Nút đổi theo trạng thái hiện tại (Khóa ↔ Mở), có xác nhận. Badge "Đã khóa" ở danh sách và trang chi tiết.

**PAGE 4 Học viên**

### Feature 4.1 – Danh sách học viên

### Task 4.1.1 – Bảng danh sách có phân trang

- What: Bảng học viên gồm: mã, tên, SĐT, trạng thái, lớp hiện tại. Phân trang, ví dụ 10 dòng mỗi trang.

- BE expected: GET /api/admin/students?page=1&pageSize=10 trả { items: [{ id, code, fullName, phone, status, currentClasses }], total, page, pageSize }. Mã học viên sinh tự động và duy nhất (ví dụ HV0001). Lớp hiện tại lấy từ các ghi danh đang học (có thể nhiều lớp).

- FE expected: Bảng có phân trang (trước/sau, số trang, tổng bản ghi), badge màu cho trạng thái, có loading và trạng thái "chưa có dữ liệu". Giữ trang hiện tại khi sửa/xóa xong.

### Feature 4.2 – Tìm kiếm và lọc

### Task 4.2.1 – Tìm theo tên / SĐT / mã

- What: Một ô tìm kiếm duy nhất cho tên, SĐT và mã học viên.

- BE expected: Tham số search: khớp chứa, không phân biệt hoa thường và dấu trên tên; khớp chứa trên SĐT và mã. Kết hợp được với phân trang và lọc.

- FE expected: Debounce khoảng 300ms trước khi gọi API. Đổi từ khóa thì về trang 1. Có nút xóa nhanh từ khóa.

### Task 4.2.2 – Lọc theo trạng thái

- What: Lọc theo trạng thái học viên: đang học / bảo lưu / nghỉ.

- BE expected: Tham số status nhận các giá trị trên (enum). Giá trị không hợp lệ trả 400.

- FE expected: Dropdown hoặc tab trạng thái, có lựa chọn "Tất cả". Giữ bộ lọc trên URL query để tải lại trang không mất.

### Feature 4.3 – Thêm học viên (kèm tạo tài khoản)

### Task 4.3.1 – Form thêm học viên

- What: Nhập: họ tên *, ngày sinh, SĐT *, email *, địa chỉ, tên và SĐT phụ huynh, trạng thái, mật khẩu tạm * (dùng để tạo tài khoản đăng nhập role student).

- BE expected: POST /api/admin/students. Trong một transaction: tạo user (role student, băm mật khẩu tạm), tạo hồ sơ học viên và sinh mã. Validate: các trường có dấu * bắt buộc; email đúng định dạng và không trùng (kể cả với tài khoản teacher/admin); SĐT hợp lệ; mật khẩu tối thiểu 8 ký tự. Lỗi trả 400/409 kèm lỗi theo từng trường. Không trả mật khẩu trong response.

- FE expected: Modal/form có validate phía client và hiển thị lỗi theo từng trường (kể cả lỗi từ BE như trùng email). Nút Lưu bị khóa khi đang gửi. Thành công thì đóng form, toast và tải lại danh sách. Page đọc query ?action=create để mở sẵn form (từ lối tắt ở Dashboard).

### Feature 4.4 – Sửa và xóa học viên

### Task 4.4.1 – Sửa thông tin học viên

- What: Cập nhật hồ sơ học viên (không sửa mã).

- BE expected: PUT /api/admin/students/{id}. Cho phép đổi email (vẫn kiểm tra trùng và đồng bộ sang tài khoản đăng nhập). Không đổi mật khẩu ở API này. 404 nếu học viên không tồn tại.

- FE expected: Dùng lại form thêm, điền sẵn dữ liệu, ẩn ô mật khẩu tạm.

### Task 4.4.2 – Xóa học viên

- What: Xóa học viên khỏi hệ thống.

- BE expected: DELETE /api/admin/students/{id}. Chặn xóa nếu học viên đã có ghi danh hoặc phiếu thu (409, message nêu rõ lý do) và gợi ý chuyển trạng thái sang "nghỉ". Nếu xóa được thì xóa luôn tài khoản đăng nhập liên quan.

- FE expected: Hộp thoại xác nhận trước khi xóa. Khi bị chặn thì hiện message lý do. Thành công thì toast và tải lại danh sách; nếu trang hiện tại hết dòng thì lùi về trang trước.

### Feature 4.5 – Ghi danh vào lớp

### Task 4.5.1 – Ghi danh học viên vào lớp

- What: Từ danh sách hoặc trang chi tiết, thêm học viên vào một lớp.

- BE expected: POST /api/admin/classes/{classId}/enrollments với { studentId }. Chặn khi lớp đã đầy (409), chặn ghi danh trùng (409), chặn khi học viên có trạng thái nghỉ. Cập nhật sĩ số lớp. BE tự tính và lưu giá tại thời điểm ghi danh từ khóa của lớp: TuitionFee = học phí gốc, DiscountPercent, DiscountAmount = TuitionFee × DiscountPercent / 100, FinalTuitionFee = TuitionFee − DiscountAmount. Không nhận giá hay giảm giá do client gửi lên. GET /api/admin/classes/available?search= trả các lớp còn chỗ kèm tuition, discountPercent, finalTuition để FE hiển thị.

- FE expected: Modal chọn lớp (dropdown có tìm kiếm, hiện sĩ số 12/20, lớp đầy thì vô hiệu hóa). Chọn lớp thì hiện học phí gốc, phần trăm giảm giá và số tiền phải đóng (chỉ để xem). Hiển thị đúng message lỗi từ BE. Thành công thì cập nhật cột "lớp hiện tại".

### Feature 4.6 – Trang chi tiết học viên

### Task 4.6.1 – Thông tin cá nhân

- What: Xem đầy đủ hồ sơ học viên và trạng thái tài khoản.

- BE expected: GET /api/admin/students/{id} trả toàn bộ thông tin hồ sơ (kể cả thông tin phụ huynh) và trạng thái tài khoản (đang mở hay đã khóa). 404 nếu không tồn tại.

- FE expected: Trang /admin/students/:id. Nút Sửa mở form như 4.4.1; nút quay lại giữ nguyên bộ lọc và trang của danh sách.

### Task 4.6.2 – Các lớp đã/đang học

- What: Lịch sử ghi danh của học viên, có thể rút học viên khỏi lớp.

- BE expected: GET /api/admin/students/{id}/enrollments trả { classId, className, courseName, startDate, endDate, status }. Rút khỏi lớp: DELETE /api/admin/classes/{classId}/enrollments/{studentId}.

- FE expected: Bảng tách nhóm "Đang học" và "Đã học"; nút rút khỏi lớp có xác nhận.

### Task 4.6.3 – Lịch sử học phí

- What: Các phiếu thu của học viên.

- BE expected: GET /api/admin/students/{id}/payments trả danh sách phiếu thu (lớp/khóa, học phí gốc, giảm giá, số tiền đã đóng, ngày thu, hình thức) kèm tổng đã đóng (dữ liệu từ bảng Payments).

- FE expected: Bảng phiếu thu, ô tổng đã đóng ở đầu bảng. Học viên chưa có phiếu thu thì hiện trạng thái "chưa có phiếu thu".

### Feature 4.7 – Quản lý tài khoản học viên

### Task 4.7.1 – Đặt lại mật khẩu

- What: Admin đặt lại mật khẩu cho học viên quên mật khẩu.

- BE expected: POST /api/admin/students/{id}/reset-password với { newPassword } (tối thiểu 8 ký tự). Băm mật khẩu, thu hồi phiên/token cũ nếu có.

- FE expected: Modal nhập mật khẩu mới (có nút hiện/ẩn), thông báo thành công và nhắc admin gửi mật khẩu cho học viên.

### Task 4.7.2 – Khóa / Mở tài khoản

- What: Chặn hoặc cho phép học viên đăng nhập.

- BE expected: POST /api/admin/students/{id}/lock và /unlock (hoặc một endpoint có cờ). Tài khoản bị khóa không đăng nhập được và trả message rõ ràng; token đang dùng bị vô hiệu.

- FE expected: Nút đổi theo trạng thái hiện tại (Khóa ↔ Mở), có xác nhận. Badge "Đã khóa" ở danh sách và trang chi tiết.

**PAGE 5 Lớp học**

### Feature 5.1 – Danh sách lớp học

### Task 5.1.1 – Bảng danh sách lớp có phân trang

- What: Bảng lớp gồm: tên lớp, khóa, giáo viên, lịch học, sĩ số (ví dụ 12/20), trạng thái. Cần có sẵn Khóa học và Giáo viên.

- BE expected: GET /api/admin/classes?page=1&pageSize=10 trả { items: [{ id, name, courseName, teacherName, schedule, enrolled, capacity, status }], total, page, pageSize }. schedule là chuỗi tóm tắt từ ClassSchedules (ví dụ "T2, T4 18:00-19:30"). enrolled do BE đếm từ ghi danh.

- FE expected: Bảng có phân trang, sĩ số dạng 12/20, badge màu cho trạng thái. Có loading và trạng thái "chưa có dữ liệu". Bấm vào dòng mở trang chi tiết lớp.

### Task 5.1.2 – Lọc theo khóa, giáo viên, trạng thái

- What: Ba bộ lọc: khóa học, giáo viên, trạng thái (sắp mở / đang học / đã kết thúc).

- BE expected: Tham số courseId, teacherId, status trên API 5.1.1, kết hợp được với nhau và với phân trang. status không hợp lệ trả 400.

- FE expected: Ba dropdown, mỗi cái có "Tất cả". Giữ bộ lọc trên URL query. Đổi bộ lọc thì về trang 1.

### Feature 5.2 – Tạo lớp

### Task 5.2.1 – Form tạo lớp

- What: Nhập: tên lớp *, khóa học * (dropdown), giáo viên * (dropdown), lịch học * (xem 5.2.2, gồm cả phòng), ngày bắt đầu *, ngày kết thúc (bỏ trống thì tự tính theo tổng số buổi của khóa và lịch học), sĩ số tối đa *, link học online (Zoom/Meet, nếu có). Trạng thái lớp không nhập tay.

- BE expected: POST /api/admin/classes. Validate: các trường có dấu * bắt buộc; khóa học và giáo viên phải tồn tại (giáo viên đang ở trạng thái "Đang dạy"); ngày kết thúc không trước ngày bắt đầu; sĩ số tối đa là số nguyên dương; link học online (nếu có) phải là URL http/https hợp lệ. Trạng thái lớp (sắp mở / đang học / đã kết thúc) do BE tự tính theo ngày bắt đầu – kết thúc. Lỗi trả 400/409 kèm lỗi theo từng trường.

- FE expected: Modal/form có validate phía client và lỗi theo từng trường. Dropdown khóa học và giáo viên có tìm kiếm. Thành công thì đóng form, toast và tải lại danh sách. Page đọc query ?action=create để mở sẵn form (từ lối tắt ở Dashboard).

### Task 5.2.2 – Lịch học có cấu trúc (nhiều buổi mỗi tuần)

- What: Lưu lịch học thành các dòng riêng (bảng ClassSchedules: thứ, giờ bắt đầu, giờ kết thúc, phòng) vì một lớp có thể học nhiều buổi mỗi tuần.

- BE expected: Request tạo/sửa lớp nhận mảng schedules: [{ dayOfWeek, startTime, endTime, roomId }], ít nhất 1 dòng. Validate: giờ kết thúc sau giờ bắt đầu; không trùng dòng; không trùng lịch của giáo viên hoặc phòng trong cùng khung giờ (409, nêu rõ lịch bị trùng); phòng phải có trong danh sách phòng ở trang Cài đặt. Cảnh báo (không chặn) nếu số buổi mỗi tuần khác với sessionsPerWeek của khóa.

- FE expected: Phần lịch học trong form cho thêm/xóa từng dòng (chọn thứ, giờ bắt đầu, giờ kết thúc, phòng). Hiển thị lỗi trùng lịch ngay tại dòng bị trùng, và dòng cảnh báo khi số buổi mỗi tuần khác khóa.

### Feature 5.3 – Sửa và xóa lớp

### Task 5.3.1 – Sửa lớp

- What: Cập nhật thông tin lớp và lịch học.

- BE expected: PUT /api/admin/classes/{id} với cùng quy tắc validate như 5.2. Sĩ số tối đa không được nhỏ hơn số học viên đã ghi danh. 404 nếu lớp không tồn tại.

- FE expected: Dùng lại form tạo, điền sẵn dữ liệu và lịch học hiện có.

### Task 5.3.2 – Xóa lớp

- What: Xóa một lớp khỏi hệ thống.

- BE expected: DELETE /api/admin/classes/{id}. Chặn xóa nếu lớp đã có học viên ghi danh (409, nêu số học viên); khi đó gợi ý chuyển trạng thái. Nếu xóa được thì xóa luôn các dòng lịch của lớp.

- FE expected: Hộp thoại xác nhận trước khi xóa. Khi bị chặn thì hiện message lý do. Thành công thì toast và tải lại danh sách.

### Feature 5.4 – Trang chi tiết lớp

### Task 5.4.1 – Thông tin lớp và lịch học

- What: Xem thông tin lớp: tên, khóa, giáo viên, lịch học, phòng, ngày bắt đầu/kết thúc, sĩ số, link học online (nếu có), trạng thái.

- BE expected: GET /api/admin/classes/{id} trả thông tin lớp kèm danh sách schedules. 404 nếu không tồn tại.

- FE expected: Trang /admin/classes/:id (đích khi bấm từ Dashboard, danh sách lớp, trang giáo viên). Nút Sửa mở form như 5.3.1.

### Task 5.4.2 – Danh sách học viên của lớp, thêm và xóa khỏi lớp

- What: Xem học viên trong lớp, thêm học viên vào lớp, xóa học viên khỏi lớp.

- BE expected: GET /api/admin/classes/{id}/students trả danh sách học viên (mã, tên, SĐT, trạng thái). Thêm: POST /api/admin/classes/{id}/enrollments (quy tắc và cách tính học phí như 4.5.1); xóa: DELETE /api/admin/classes/{id}/enrollments/{studentId}. Chặn thêm khi lớp đầy và chặn thêm trùng học viên (409, message rõ ràng).

- FE expected: Bảng học viên có nút "Thêm học viên" (chọn từ danh sách có tìm kiếm, ẩn học viên đã trong lớp) và nút xóa có xác nhận. Hiển thị sĩ số 12/20 và vô hiệu nút thêm khi lớp đầy.

**PAGE 6 Học phí**

### Feature 6.1 – Danh sách phiếu thu

### Task 6.1.1 – Bảng phiếu thu có phân trang

- What: Bảng phiếu thu gồm: học viên, lớp/khóa, học phí gốc, giảm giá, số tiền đã đóng, ngày thu, hình thức. Dữ liệu từ bảng Payments, cũng là nguồn cho trang Tuition của student. Mỗi lần ghi danh có tối đa một phiếu thu, đóng một lần đủ học phí sau giảm giá; không có công nợ hay đóng góp nhiều lần.

- BE expected: GET /api/admin/payments?page=1&pageSize=10 trả { items: [{ id, studentName, className, courseName, tuitionFee, discountPercent, amount, paidDate, method }], total, page, pageSize }, sắp xếp ngày thu mới nhất trước. amount bằng FinalTuitionFee của ghi danh.

- FE expected: Bảng có phân trang, số tiền có dấu phân cách và đơn vị VNĐ, cột giảm giá hiện dạng "20%" (không giảm thì hiện "--"). Có loading và trạng thái "chưa có dữ liệu".

### Feature 6.2 – Tìm kiếm

### Task 6.2.1 – Tìm theo học viên

- What: Ô tìm kiếm phiếu thu theo tên học viên.

- BE expected: Tham số search trên API 6.1.1: khớp chứa, không phân biệt hoa thường và dấu trên tên (và mã) học viên.

- FE expected: Debounce khoảng 300ms; đổi từ khóa thì về trang 1; có nút xóa nhanh từ khóa.

### Feature 6.3 – Tạo phiếu thu

### Task 6.3.1 – Form tạo phiếu thu

- What: Nhập: chọn học viên *, chọn lớp * (tự điền học phí gốc, giảm giá và số tiền phải đóng), hình thức (tiền mặt / chuyển khoản), ngày thu, ghi chú. Số tiền không nhập tay.

- BE expected: POST /api/admin/payments với { studentId, classId, method, paidDate, note } (hoặc enrollmentId). Validate: học viên phải đang ghi danh lớp đã chọn; ghi danh đó chưa có phiếu thu (409, message nêu rõ); hình thức thuộc danh sách cho phép; ngày thu mặc định là hôm nay và không ở tương lai. Số tiền do BE gán bằng FinalTuitionFee của ghi danh (không nhận từ client) và lưu phiếu trong một transaction, chỉ tạo khi khoản thu đã được xác nhận. Không có trạng thái nợ, không đóng góp nhiều lần.

- FE expected: Modal/form: chọn học viên trước, sau đó dropdown lớp chỉ hiện các lớp học viên đó đang học và chưa có phiếu thu; chọn lớp thì tự điền học phí gốc, giảm giá và số tiền phải đóng (chỉ đọc). Báo lỗi theo từng trường. Thành công thì toast và tải lại danh sách. Page đọc query ?action=create để mở sẵn form (từ lối tắt ở Dashboard).

### Feature 6.4 – In biên lai

### Task 6.4.1 – In biên lai của một phiếu thu

- What: In biên lai cho phiếu thu bằng window.print().

- BE expected: GET /api/admin/payments/{id} trả đủ dữ liệu biên lai: tên và logo trung tâm (từ trang Cài đặt), học viên, lớp/khóa, học phí gốc, phần trăm giảm giá, số tiền giảm, số tiền đã đóng, hình thức, ngày thu, người lập phiếu.

- FE expected: Nút In ở mỗi dòng mở khung biên lai gọn gàng, hiện đủ học phí gốc, giảm giá và số tiền đã đóng; gọi window.print() với CSS in riêng (ẩn sidebar, header, nút bấm). Khổ A5 hoặc A4 (chốt với nhóm).

**PAGE ****7**** Homepage**

### Feature 7.1 – Bài viết trên trang chủ

### Task 7.1.1 – Danh sách bài viết

- What: Xem các bài viết đang hiển thị hoặc ẩn trên trang chủ (tin tức, thông báo, câu chuyện học viên).

- BE expected: GET /api/admin/posts?page=1&pageSize=10 trả { items: [{ id, title, thumbnailUrl, status, publishedAt }], total, page, pageSize }; status gồm Nháp / Đã đăng. Hỗ trợ search theo tiêu đề.

- FE expected: Bảng có ảnh nhỏ, tiêu đề, trạng thái, ngày đăng; có ô tìm kiếm và phân trang; nút Thêm bài viết.

### Task 7.1.2 – Thêm và sửa bài viết

- What: Soạn bài viết gồm: tiêu đề *, nội dung *, ảnh bìa, trạng thái (Nháp / Đã đăng).

- BE expected: POST /api/admin/posts và PUT /api/admin/posts/{id}. Validate: tiêu đề và nội dung bắt buộc; ảnh bìa giới hạn định dạng (jpg, png, webp) và dung lượng. Nội dung được làm sạch (sanitize HTML) trước khi lưu để tránh chèn mã độc. Bài ở trạng thái Đã đăng thì ghi publishedAt.

- FE expected: Form có ô soạn nội dung (trình soạn thảo cơ bản), upload và xem trước ảnh bìa, công tắc Nháp/Đã đăng. Báo lỗi theo từng trường. Thành công thì toast và quay về danh sách.

### Task 7.1.3 – Xóa hoặc ẩn bài viết

- What: Xóa bài viết hoặc chuyển về Nháp để ẩn khỏi trang chủ.

- BE expected: DELETE /api/admin/posts/{id}; ẩn bằng cách PUT đổi trạng thái về Nháp.

- FE expected: Nút xóa có hộp thoại xác nhận; nút ẩn/hiện đổi trạng thái ngay trên dòng.

### Feature 7.2 – Hình ảnh trên trang chủ

### Task 7.2.1 – Thư viện hình ảnh (banner/gallery)

- What: Quản lý ảnh hiển thị trên trang chủ: thêm, xóa, sắp xếp thứ tự.

- BE expected: GET/POST/DELETE /api/admin/homepage-images và PUT /api/admin/homepage-images/order (nhận mảng id theo thứ tự mới). Upload chỉ nhận jpg, png, webp, tối đa khoảng 5 MB mỗi ảnh; trả về URL ảnh. Mỗi ảnh có chú thích (alt text) tùy chọn.

- FE expected: Lưới ảnh có nút tải ảnh từ máy lên (chọn nhiều ảnh cùng lúc hoặc kéo thả), xóa có xác nhận, kéo để đổi thứ tự. Hiển thị tiến trình upload và lỗi khi file không hợp lệ.

### Feature 7.3 – Dữ liệu cho trang chủ công khai

### Task 7.3.1 – API công khai cho trang chủ

- What: Trang chủ (không cần đăng nhập) lấy bài viết đã đăng và hình ảnh do admin quản lý.

- BE expected: GET /api/public/posts (chỉ bài Đã đăng, sắp xếp mới nhất trước) và GET /api/public/homepage-images (theo thứ tự đã sắp). Không yêu cầu đăng nhập và không trả dữ liệu nội bộ của admin.

- FE expected: Trang chủ hiển thị danh sách bài viết và ảnh từ hai API này; có loading và trạng thái "chưa có dữ liệu".

**PAGE ****8**** Cài đặt**

### Feature 8.1 – Đổi mật khẩu admin

### Task 8.1.1 – Form đổi mật khẩu

- What: Admin đổi mật khẩu của chính mình: mật khẩu hiện tại *, mật khẩu mới *, nhập lại mật khẩu mới *.

- BE expected: POST /api/admin/account/change-password với { currentPassword, newPassword }. Validate: mật khẩu hiện tại đúng; mật khẩu mới tối thiểu 8 ký tự và khác mật khẩu cũ. Sai mật khẩu hiện tại trả 400 kèm lỗi theo trường.

- FE expected: Form có ba ô mật khẩu (có nút hiện/ẩn), kiểm tra khớp "nhập lại" ở phía client, báo lỗi theo từng trường. Thành công thì toast.

### Feature 8.2 – Thông tin trung tâm

### Task 8.2.1 – Xem và cập nhật thông tin trung tâm

- What: Quản lý thông tin trung tâm: tên, logo, địa chỉ, SĐT. Thông tin này dùng cho biên lai và trang chủ.

- BE expected: GET/PUT /api/admin/settings/center. Validate: tên bắt buộc, SĐT hợp lệ; logo giới hạn định dạng (png, jpg, svg) và dung lượng. Chỉ có một bản ghi cấu hình.

- FE expected: Form điền sẵn dữ liệu hiện tại, upload và xem trước logo. Thành công thì toast và cập nhật tên/logo trên header.

### Feature 8.3 – Quản lý phòng học

### Task 8.3.1 – Danh sách và thêm phòng học

- What: Quản lý các phòng học: tên, sức chứa. Danh sách phòng dùng cho lịch học của lớp.

- BE expected: GET /api/admin/rooms và POST /api/admin/rooms với { name, capacity }. Validate: tên bắt buộc và không trùng; sức chứa là số nguyên dương.

- FE expected: Bảng phòng gồm tên, sức chứa, nút thêm/sửa/xóa. Form thêm dạng modal, báo lỗi theo từng trường.

### Task 8.3.2 – Sửa và xóa phòng học

- What: Cập nhật hoặc xóa phòng học.

- BE expected: PUT /api/admin/rooms/{id} và DELETE /api/admin/rooms/{id}. Chặn xóa nếu phòng đang được dùng trong lịch học của lớp (409, nêu số lớp đang dùng). Khi giảm sức chứa, cảnh báo nếu nhỏ hơn sĩ số của lớp đang dùng phòng.

- FE expected: Dùng lại form thêm cho phần sửa. Hộp thoại xác nhận khi xóa; hiện message lý do khi bị chặn.