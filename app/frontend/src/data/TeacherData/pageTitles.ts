import type { PageTitle } from "../../types";

// Khóa là tiền tố đường dẫn: /teacher/classes/5 dùng tiêu đề của "/teacher/classes/"
export const teacherPageTitles: Record<string, PageTitle> = {
    "/teacher/dashboard": { title: "Dashboard", subtitle: "Tổng quan công việc hôm nay." },
    "/teacher/schedule": { title: "Lịch dạy", subtitle: "Lịch tuần / tháng, lịch rảnh 1 kèm 1, đơn nghỉ / đổi buổi." },
    "/teacher/classes/": { title: "Chi tiết lớp", subtitle: "Học viên, buổi học, giáo án và chuyên cần của lớp." },
    "/teacher/classes": { title: "Lớp phụ trách", subtitle: "Các lớp Admin phân công cho bạn." },
    "/teacher/sessions/": { title: "Chi tiết buổi học", subtitle: "Giáo án, nhật ký, tài liệu và link học online." },
    "/teacher/attendance": { title: "Điểm danh", subtitle: "Điểm danh theo buổi. Khóa sau 48 giờ kể từ khi buổi kết thúc." },
    "/teacher/assignments": { title: "Bài tập", subtitle: "Giao bài Writing / Speaking / Quiz và theo dõi bài nộp." },
    "/teacher/grading/": { title: "Chấm bài", subtitle: "Chấm theo tiêu chí IELTS, đánh dấu lỗi, nhận xét." },
    "/teacher/grading": { title: "Chấm bài", subtitle: "Bài nộp cần chấm. Chưa chấm sau 24 giờ là trễ hạn." },
    "/teacher/grades": { title: "Kiểm tra & Sổ điểm", subtitle: "Bài kiểm tra, sổ điểm theo trọng số, xuất Excel." },
    "/teacher/students/": { title: "Hồ sơ học viên", subtitle: "Tiến bộ band, chuyên cần, nhận xét định kỳ." },
    "/teacher/students": { title: "Học viên", subtitle: "Học viên trong các lớp bạn dạy." },
    "/teacher/requests": { title: "Yêu cầu & Thông báo", subtitle: "Duyệt yêu cầu của học viên, gửi thông báo cho lớp." },
    "/teacher/materials": { title: "Tài liệu giảng dạy", subtitle: "Tài liệu gắn theo từng buổi học." },
    "/teacher/profile": { title: "Hồ sơ cá nhân", subtitle: "Thông tin, bảng công, đánh giá và mật khẩu." },
};

export function findTeacherPageTitle(pathname: string): PageTitle | undefined {
    if (teacherPageTitles[pathname]) return teacherPageTitles[pathname];
    const key = Object.keys(teacherPageTitles)
        .filter(k => k.endsWith("/") && pathname.startsWith(k))
        .sort((a, b) => b.length - a.length)[0];
    return key ? teacherPageTitles[key] : undefined;
}
