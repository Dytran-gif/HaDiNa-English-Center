# Code Review — 24-fe-admin-design-system (đợt 1)

**Kết luận:** PASS trong phạm vi F2/code/docs; cần QA trình duyệt ở đợt 4.

Tự review theo .claude/agents/code-reviewer.md và yêu cầu người dùng; không giao sub-agent.

## Đã kiểm tra

- Không đổi backend/API/auth/route/dependencies. Thay import page sang adapter UI không thay payload/callback/giá/ngày hoặc logic phân quyền.
- AdminTokens chỉ áp dụng .admin-layout và backdrop của dialog trong Admin; không sửa root token/global components hoặc trang Public/Teacher/Student. Menu giữ đủ 11 route, 5 nhóm; giữ export phẳng tương thích.
- Primary xanh, danger có scope rõ, disabled xám, focus-visible; 7 cặp token contrast >=4.5:1. Password toggle giữ value/type validation cũ, id/help/error aria liên kết. IconButton có label/title, SVG trang trí aria-hidden.
- Button loading/disabled vô hiệu thao tác; link disabled render thành button thay vì anchor vẫn điều hướng. Default type=button an toàn, các submit vẫn truyền type=submit.
- Native dialog có nhãn, Hủy autofocus trong Confirm, Escape/backdrop khi không pending, pending chặn đóng/double click, lỗi Promise giữ đúng message. Khóa scroll và khôi phục; backdrop được khai báo token trực tiếp để không phụ thuộc inheritance.
- Toast/context chỉ thuộc Admin, không liên quan AuthContext. Gộp key/max3/timer pause; chưa gắn mỗi mutation đúng phân kỳ. Feedback chỉ chọn lỗi hoặc thành công, không phát cả hai cho cùng tình huống.
- Docs phản ánh 8 trang API thật và 3 trang minh họa. Không sửa lịch sử bàn giao; tài liệu đồ án cũ có nhãn thời điểm.

## Thông tin / giới hạn

- [INFO] F4 sửa tài liệu dùng chung theo yêu cầu; đã liệt kê trong plan. Không sửa code của vùng khác.
- [INFO] Lint 0 lỗi; 1 warning Fast Refresh AuthContext đã có từ baseline, không sửa auth/không suppress.
- [INFO] Browser/native pipe chưa hoạt động, không có ảnh trước/sau. Build/SSR/contrast không thay thế click/focus/đo viewport thực tế.
- [INFO] Demo/error trùng vẫn còn và được ghi ⬜ F3-A.1; Khóa học/Settings chuyên biệt/toast từng mutation chưa coi hoàn thành.

Không thấy lỗi code chặn còn lại trong phạm vi sau tự review. Không tuyên bố hoàn tất toàn bộ yêu cầu 5 đợt.
