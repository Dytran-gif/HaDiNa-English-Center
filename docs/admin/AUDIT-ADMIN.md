Cập nhật lần cuối: 2026-10-30 — lượt 1/3. Page đã audit: 1, 2.

# Kiểm toán ADMIN

## Tóm tắt

Đối chiếu `docs/admin/ADMIN-SPEC.md:7` đến `:123`, bằng đọc code; không chạy ứng dụng, không truy cập DB, không tạo migration. Chỉ Page 1–2 được kết luận đầy đủ. Quét phần dư toàn admin là kiểm kê cấu trúc, không thay thế audit Page 3–8.

| Phạm vi | Phía | ✅ | ⚠️ | ❌ | 🔶 | ⏸ | ❓ |
|---|---|---|---|---|---|---|---|
| Page 1: 7 task | BE | 1 | 0 | 6 | 0 | 0 | 0 |
| Page 1: 7 task | FE | 1 | 1 | 5 | 0 | 0 | 0 |
| Page 2: 6 task | BE | 0 | 3 | 0 | 2 | 0 | 1 |
| Page 2: 6 task | FE | 0 | 2 | 0 | 4 | 0 | 0 |
| Tổng 13 task / 26 nhãn | BE + FE | 2 | 6 | 11 | 6 | 0 | 1 |

✅ khớp qua code; ⚠️ có nhưng lệch; ❌ không có; 🔶 một phần; ⏸ bị chặn; ❓ chưa kiểm chứng. Không dùng ⏸ để che phần chưa viết. ✅ không có nghĩa đã test tích hợp DB. Các tiểu mục phụ thuộc runtime chưa kiểm chứng được ghi ngay trong dòng. Có **8 mục dư**, không tự xóa mục nào.

Năm phát hiện ưu tiên:
1. Dashboard chưa có cả sáu task BE số liệu; FE dùng mock và thiếu hai biểu đồ, lịch hôm nay, lớp sắp đầy (1.2–1.6.1).
2. Khóa học dùng bảng thay vì lưới card; API thiếu `currentStudents/maxStudents`, không thể hiện sức chứa theo spec (2.1.1).
3. Form tạo/sửa chưa phát hiện thiếu một số trường số phía BE; lỗi trùng tên không có lỗi theo trường, FE bỏ `fieldErrors`; thiếu preview/nhắc snapshot/toast (2.3.1, 2.4.1).
4. Tìm tên khóa chỉ `Contains`; chưa kiểm chứng được tính không phân biệt hoa/dấu vì chưa biết collation DB (2.2.1).
5. Phân trang BE có phép nhân int có thể tràn; FE luôn hiện pager và không cuộn lên khi đổi trang (2.1.2).

Kiểm tra kỹ thuật: `dotnet build` PASS, 0 warning/0 error; `npm.cmd run build` PASS; `npm.cmd run lint` PASS, 0 error/1 warning có sẵn tại `app/frontend/src/context/AuthContext.tsx:53` (only-export-components). Không suy từ build ra API chạy đúng với DB.

Bằng chứng không có dashboard: đã tìm `dashboard`, `revenue-by-month`, `new-students-by-month`, `today-classes`, `almost-full-classes` trong Controllers/Admin, Dtos/Admin và Services; không có route/handler tương ứng. Controllers/Admin hiện gồm Classes, Courses, Payments, Rooms, Settings, Students, TeacherRequests, Teachers; Program.cs:65/97 đăng ký/map controller. Không lấy một dòng file không tồn tại làm bằng chứng.

Tự review theo code-reviewer: chọn ngẫu nhiên và mở lại chứng cứ cho 5 dòng **2.4.1, 1.6.1, 2.1.1, 1.1, 2.3.1**. Đã đối chiếu lại CourseRequest, CoursesController, ResourcePage, Dashboard, query ở Classes/Payments, EnrollmentService và PagedResult; đủ 26 nhãn; review bổ sung đổi BE 2.2.1 sang ❓ vì collation DB chưa biết. Không tạo báo cáo review ngoài danh sách đầu ra được phép.

Quy ước đường dẫn: **B** = `app/backend/EnglishCenter.Api/EnglishCenter.Api/`; **F** = `app/frontend/src/`. Mọi đường dẫn bên dưới nối với tiền tố này từ gốc repo. `CC` = B`Controllers/Admin/CoursesController.cs`; `CR` = B`Dtos/Admin/CourseRequest.cs`; `RP` = F`pages/admin/Components/Api/ResourcePage.tsx`; `CFG` = F`pages/admin/Components/Api/resourceConfigs.ts`; `D` = F`pages/admin/Dashboard/Dashboard.tsx`; `S` = F`pages/admin/Dashboard/Components/StatsOverview.tsx`. Ký hiệu `:n` là dòng, tên hàm ghi trong nội dung.

## Ma trận

### Page 1 — Dashboard

| Mã task | Tên | BE | FE | Lệch/Thiếu cụ thể | Bằng chứng (file:dòng) | Mức độ (Cao/Trung/Thấp) | Đề xuất sửa (ngắn) |
|---|---|---|---|---|---|---|---|
| 1.1 | Ba nút lối tắt | ✅ | ✅ | Không cần API dashboard riêng. Ba link có action=create; các trang đích đọc query để mở form khi mount. POST có quyền admin. Chưa test thao tác trình duyệt/DB. | D:11; RP:67 (students); Fpages/admin/Classes/ClassesManagement.tsx:53; Fpages/admin/Payments/PaymentsManagement.tsx:36; BControllers/Admin/StudentsController.cs:14/:179; BControllers/Admin/ClassesController.cs:14/:187; BControllers/Admin/PaymentsController.cs:16/:53 | Thấp | Giữ hành vi, kiểm thử tích hợp khi có DB. |
| 1.2 | Bốn KPI | ❌ | ⚠️ | Thiếu GET dashboard/kpis. FE là số mock: khóa, giáo viên, học viên, blog; thiếu lớp đang mở/doanh thu tháng, không lọc Studying; không API/skeleton/lỗi --. | BProgram.cs:97 + kiểm kê controller ở Tóm tắt; S:4/:10/:11/:13/:14/:16 | Cao | Chốt lớp đang mở, viết API tính số thật rồi nối đúng 4 KPI. |
| 1.3 | Doanh thu 12 tháng | ❌ | ❌ | Không endpoint revenue-by-month, không chuỗi tháng liên tục/zero-fill; Dashboard không có biểu đồ, đơn vị tiền/loading/lỗi. | BProgram.cs:97 + kiểm kê; D:8 (toàn hàm chỉ actions/KPI/recent) | Cao | API theo PaidDate và biểu đồ đủ 12 tháng. |
| 1.4 | Học viên mới 12 tháng | ❌ | ❌ | Không endpoint new-students-by-month; không biểu đồ theo ngày tạo học viên/loading/lỗi. | BProgram.cs:97 + kiểm kê; D:8 | Cao | Bổ sung API và biểu đồ tháng liên tục. |
| 1.5.1 | Lớp có lịch hôm nay | ❌ | ❌ | Không today-classes; thiếu chọn theo thứ/ngày lớp, giờ/GV/phòng/sĩ số/sức chứa/sắp giờ; FE không danh sách/link chi tiết. | BProgram.cs:97 + kiểm kê; D:8 | Cao | Tính lịch hôm nay, DTO đúng spec và danh sách liên kết. |
| 1.5.2 | Tổng lớp hôm nay | ❌ | ❌ | Không totalToday trong response; FE không phần tóm tắt. | BProgram.cs:97 + kiểm kê; D:8 | Trung | Trả totalToday cùng response 1.5.1. |
| 1.6.1 | Lớp sắp đầy | ❌ | ❌ | Không almost-full-classes threshold/limit; không lọc tỷ lệ kể cả vừa đầy; FE không progress/link. | BProgram.cs:97 + kiểm kê; D:8 | Cao | API ratio >= threshold và giới hạn, FE tiến độ. |

### Page 2 — Khóa học

| Mã task | Tên | BE | FE | Lệch/Thiếu cụ thể | Bằng chứng (file:dòng) | Mức độ (Cao/Trung/Thấp) | Đề xuất sửa (ngắn) |
|---|---|---|---|---|---|---|---|
| 2.1.1 | Lưới 4/2 card | ⚠️ | ⚠️ | GET mặc định16, có items/total/page/pageSize và quyền admin; thiếu currentStudents/maxStudents. activeStudents đếm enrollment Active ở lớp chưa kết thúc, không phải field hợp đồng. FE gọi API thật nhưng bảng, không grid/sĩ số tối đa/sessionsPerWeek/badge giảm giá/skeleton; detail mở modal. finalTuition là tùy chọn nên không tính thiếu bắt buộc. | CC:12/:26/:39/:49/:69; BDtos/Admin/CourseResponse.cs:16/:18; BDtos/Common/PagedResult.cs:5; CFG:12/:14; RP:64/:97/:98/:99 | Cao | Chốt cách đếm, bổ sung DTO và grid card đúng spec. |
| 2.1.2 | Phân trang 16 khóa | ⚠️ | ⚠️ | BE pageSize16 và total alias đúng, nhưng Skip((page-1)*pageSize) int có thể tràn, không bảo đảm trang cực lớn trả rỗng. FE lưu page URL nhưng hiện pager cả <=16 và không scroll-top; trang vượt phạm vi thông thường hiển thị rỗng. | CC:49/:51/:65; BDtos/Common/PagedResult.cs:7; CFG:13; RP:58/:73/:104; Fpages/admin/Components/Ui/Pagination.tsx:7 | Trung | Chống overflow; ẩn pager khi <=16, cuộn lên khi đổi trang. |
| 2.2.1 | Tìm tên khóa | ❓ | 🔶 | BE Contains, total sau lọc đúng; không explicit CI_AI, collation thực DB chưa kiểm chứng nên chưa đủ bằng chứng kết luận khớp hay lệch yêu cầu tìm không dấu. FE debounce300ms/reset page/URL có; không nút xóa riêng, type=search có thể có native clear tùy browser, chưa QA; empty chưa đúng câu spec. | CC:57/:60/:63; Fpages/admin/Components/Api/SearchField.tsx:8/:13; RP:73/:91/:98 | Trung | Bảo đảm CI_AI; thêm clear ổn định và empty đúng ngữ cảnh. |
| 2.3.1 | Thêm khóa | 🔶 | 🔶 | BE đủ phần lớn Range/so sánh, POST201 và kiểm tra trùng409. BandFrom/BandTo/Tuition non-nullable mặc định0 nên không phân biệt bỏ trường bắt buộc với nhập0; 409 chỉ message, không lỗi name. FE có form/HTML validation/chặn busy/đóng/reload; band là number thay dropdown; không preview giá trong form, không hiển thị lỗi từng trường/validate so sánh phía FE; thành công Notice thay toast. DTO400 có errors mặc định ApiController, không khẳng định thiếu mọi lỗi theo trường ở BE. | CR:13/:16/:25/:32; CC:90/:95/:110/:113; BProgram.cs:65; CFG:15; RP:78/:81/:85/:106/:107/:109; Fpages/admin/Components/Api/AdminUi.tsx:3; Fservices/apiClient.ts:35 | Cao | Required có nhận biết thiếu; lỗi409 theo trường; dropdown/preview/field errors/toast. |
| 2.4.1 | Sửa khóa | 🔶 | 🔶 | BE có PUT/404/trùng tên, giữ snapshot giá ghi danh; còn thiếu Required số/lỗi409 theo trường như tạo. Không tự sửa lịch lớp cũ; tác động số buổi cần người chốt. FE reuse/prefill đúng, thiếu nhắc chỉ ghi danh mới, field errors và toast; form còn thiếu như 2.3.1. | CC:117/:120/:126/:129/:135; CR:13/:25; BServices/EnrollmentService.cs:52/:60; RP:74/:76/:86/:106/:108 | Cao | Giữ snapshot, chốt số buổi lớp cũ; bổ sung nhắc và form thống nhất. |
| 2.4.2 | Xóa khóa | ⚠️ | 🔶 | BE404/409 khi có bất kỳ lớp đúng, nhưng message không nêu số lớp. FE có confirm, lỗi server, reload và lùi trang khi xóa dòng cuối; thành công Notice thay toast. | CC:146/:149/:154/:155; RP:80/:81/:96/:101; Fpages/admin/Components/Api/AdminUi.tsx:3 | Trung | Đếm lớp vào message409; tích hợp toast. |

## Phần dư (➕)

| Mục | Vị trí | Phạm vi | Đề xuất (a/b/c) | Lý do |
|---|---|---|---|---|
| KPI Khóa học đang mở | S:11 | Dashboard FE/mock | c | Không nằm trong 4 KPI spec; hỏi thay hoàn toàn hay thêm phụ. Số đang đếm tất cả mock khóa. |
| KPI Bài viết blog | S:14 | Dashboard FE/mock | c | Ngoài KPI spec; không tự giữ thay doanh thu. |
| Khóa học gần đây | D:9/:17 | Dashboard FE/mock | b | Đã được yêu cầu tinh chỉnh ở đợt UI trước; giữ bổ trợ, không tính thay biểu đồ/lịch spec. |
| Báo cáo: menu/route, thống kê và CSV demo | Fdata/AdminData/sidebarMenuItems.ts:7; Froutes.tsx:92; Fpages/admin/Reports/Reports.tsx:17/:32/:43 | FE ngoài 8 page spec | c | Chưa có page báo cáo độc lập trong spec; dữ liệu local/mock, không phải dashboard API thật. |
| Phòng học là menu/route riêng | Fdata/AdminData/sidebarMenuItems.ts:23; Froutes.tsx:93; BControllers/Admin/RoomsController.cs:12 | Điều hướng FE; BE thuộc Page8 | c | Chức năng có trong Page8 nên không coi API rooms là thừa; chỉ hỏi bố trí menu riêng hay trong Cài đặt. |
| teacher-requests BE | BControllers/Admin/TeacherRequestsController.cs:13/:30/:56/:138 | Endpoint ngoài spec | b | Giữ có chủ đích theo yêu cầu lượt audit; không đánh thiếu vì ngoài spec. |
| Đơn giáo viên FE vẫn còn menu/route/trang | Fdata/AdminData/sidebarMenuItems.ts:14; Froutes.tsx:97; Fpages/admin/TeacherRequests/TeacherRequests.tsx:14/:16 | FE ngoài spec | c | Trái chủ trương FE hoãn: thực tế chưa gỡ. Đề xuất ẩn menu/route ở đợt sửa được duyệt; giữ BE. |
| Các alias/trường mở rộng phân trang và khóa | BDtos/Common/PagedResult.cs:6/:10; BDtos/Admin/CourseResponse.cs:16/:18 | BE hợp đồng, FE đọc field cũ | b | totalItems/totalPages, finalPrice/openClasses/activeStudents có người dùng hiện tại; giữ tương thích nhưng phải bổ sung field bắt buộc spec. |

Đã quét menu/route, resourceConfigs, Dashboard, Blog, Reports, TeacherRequests và các controller admin. Không tự gán thêm cột/form của Page3–8 là dư trước khi đối chiếu từng task ở lượt sau. Bảng khóa thay grid là lệch 2.1.1, không đếm lại một mục dư.

## Cần người chốt

Các ghi chú cũ trong ADMIN-TRACKER về lớp đang mở/lịch lớp không đủ để coi yêu cầu mơ hồ của spec đã được người dùng xác nhận. Lượt này không tự chốt lại.

| Câu hỏi | Phương án | Đề xuất để duyệt |
|---|---|---|
| Lớp đang mở tính thế nào? | Ongoing; hoặc Upcoming + Ongoing | Upcoming + Ongoing, dùng chung Dashboard/courses, xác nhận trước triển khai. |
| Thứ tự khóa mặc định? | Tên tăng dần; hoặc CreatedAt giảm dần | Giữ CreatedAt giảm dần hiện tại (CC:65), tên/Id làm tie-break nếu cần. Spec cho hai cách nên không gán lỗi vì chọn ngày tạo. |
| Sửa số buổi/buổi tuần có ảnh hưởng lớp cũ? | Chỉ lớp mới; hoặc cập nhật lớp cũ có kiểm tra lịch | Giữ lớp cũ, tạo thao tác điều chỉnh riêng nếu cần. Hiện CC:135 chỉ sửa Course. |
| currentStudents là số người hay số lượt ghi danh? | Distinct StudentId; hoặc tổng enrollment Active | Distinct người trong các lớp đang mở; maxStudents tổng sức chứa. Cần xác nhận quy tắc khi một người ở nhiều lớp cùng khóa. |
| Giới hạn ngoài spec 1000 buổi/1 tỷ học phí? | Giữ; hoặc bỏ/đổi giới hạn | Xác nhận giới hạn sản phẩm; CR:19/:25 và CFG:15 đang áp dụng ở cả hai phía. |
| KPI phụ, Báo cáo, vị trí Phòng học? | Chỉ giữ đúng spec; hoặc giữ các bổ sung có chủ đích | Ưu tiên 4 KPI spec; Báo cáo cần duyệt phạm vi; Phòng học có thể giữ shortcut tới chức năng Page8. |
| FE Đơn giáo viên đang hoãn xử lý thế nào? | Ẩn menu và route; hoặc giữ truy cập có nhãn | Ẩn ở đợt sửa; vẫn giữ controller BE. Lượt này chỉ ghi nhận. |

## Chỗ sản phẩm lệch do FE và BE không khớp nhau

- Dashboard không có luồng FE↔BE: D:6/S:4 nhập mock, không gọi các endpoint spec. Không coi số demo là số live.
- Courses hiện FE↔BE **khớp field cũ** activeStudents/finalPrice (CFG:14, CourseResponse:16/:19), nhưng cả hai lệch hợp đồng currentStudents/maxStudents. Không báo nhầm là FE đang đọc field BE không trả.
- `total` **đã có** qua alias PagedResult.cs:7; FE vẫn đọc `totalItems` (RP:71). Hiện không mất tổng, nhưng phụ thuộc alias cũ. Khi chuẩn hóa phải giữ tương thích hoặc đổi đồng bộ.
- ApiClient giữ `fieldErrors` (Fservices/apiClient.ts:3/:35), ResourcePage chỉ lấy Error.message (RP:20/:81) và không truyền error vào InputField (RP:107). BE DTO400 có errors mặc định; 409 trùng tên chỉ có message (CC:96/:127). Cần chuẩn hóa hai phía, không chỉ sửa giao diện.
- Quyền admin: CC:13; Fcomponents/ProtectedRoute.tsx:11 và Froutes.tsx bảo vệ khu admin; API helper Fservices/admin/useAdminApi.ts:8/:13 dùng Bearer token. Không thay đổi auth trong lượt audit.

## Ảnh hưởng tới file dùng chung

- `PagedResult.cs:5`: giữ TotalItems/Total đồng thời khi sửa paging, kiểm tra các portal phụ thuộc; không đổi chỉ để làm đúng FE khóa.
- `EnrollmentService.cs:52`: nguồn snapshot học phí; sửa Course không được hồi tố giá ghi danh cũ. Chưa sửa service trong lượt này.
- `Program.cs:65/:97` và `services/apiClient.ts:34`: chuẩn hóa response validation có thể ảnh hưởng Teacher/Student; cần chủ vùng review trước đợt sửa.
- `ResourcePage.tsx:56`, `resourceConfigs.ts:12`, `AdminUi.tsx:3`, `Ui/Pagination.tsx:7`, `Ui/FormField.tsx:5`, `SearchField.tsx:8` dùng chung các trang admin; ưu tiên component khóa riêng/props tùy chọn, không làm đổi trang chưa audit.
- CoursesController.Today (CC:23) còn DateTime.Now thay AppTime; cần thống nhất giờ địa phương trước truy vấn theo ngày. Chưa xác minh timezone hạ tầng.
- Không có thay đổi code, API, schema, dependency, route hay auth trong audit. Không có kết luận runtime DB/collation/browser.
