import { teachers } from "../teachers";

// LƯU Ý QUAN TRỌNG: tài khoản đăng nhập demo (teacher@demo.com trong
// src/data/users.ts) chưa được liên kết với đúng giáo viên trong
// src/data/teachers.ts (2 nguồn dữ liệu này hiện tách rời, không có
// teacher_id chung). Vì chưa có backend thật để liên kết user <-> teacher,
// tạm thời DÙNG CỨNG giáo viên đầu tiên trong danh sách làm "giáo viên đang
// đăng nhập" để có dữ liệu demo cho Dashboard/Lịch dạy/Hồ sơ.
//
// TODO: khi có backend thật, thêm field teacher_id vào User và lấy đúng
// giáo viên tương ứng với tài khoản đang đăng nhập, xóa file này đi.
export const CURRENT_TEACHER_ID = 1;

export function getCurrentTeacher() {
    return teachers.find((t) => t.teacher_id === CURRENT_TEACHER_ID) ?? teachers[0];
}
