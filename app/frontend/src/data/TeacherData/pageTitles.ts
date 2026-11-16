import type { PageTitle } from "../../types";

// Khóa là tiền tố đường dẫn: /teacher/classes/5 dùng tiêu đề của "/teacher/classes/"
export const teacherPageTitles: Record<string, PageTitle> = {
    "/teacher/dashboard": { title: "Dashboard", subtitle: "Tổng quan lớp, lịch dạy hôm nay và bài nộp mới." },
    "/teacher/schedule": { title: "Lịch dạy", subtitle: "Lịch theo tuần, sinh từ lịch học Admin xếp cho lớp." },
    "/teacher/classes/": { title: "Chi tiết lớp", subtitle: "Thông tin lớp, học viên, chuyên cần và nhận xét." },
    "/teacher/classes": { title: "Lớp phụ trách", subtitle: "Các lớp Admin phân công cho bạn." },
    "/teacher/attendance": { title: "Điểm danh", subtitle: "Điểm danh theo ngày học của lớp. Chỉ điểm danh hôm nay hoặc ngày đã qua." },
    "/teacher/students/": { title: "Hồ sơ học viên", subtitle: "Lớp đang học, chuyên cần, bài đã nộp và nhận xét." },
    "/teacher/students": { title: "Học viên", subtitle: "Học viên trong các lớp bạn dạy." },
    "/teacher/assignments": { title: "Bài tập", subtitle: "Giao file đề bài theo khóa, tải bài học viên nộp." },
    "/teacher/feedback": { title: "Nhận xét học viên", subtitle: "Học viên xem nhận xét ở trang Feedback của mình." },
    "/teacher/profile": { title: "Hồ sơ cá nhân", subtitle: "Thông tin, ảnh đại diện và mật khẩu." },
};

export function findTeacherPageTitle(pathname: string): PageTitle | undefined {
    if (teacherPageTitles[pathname]) return teacherPageTitles[pathname];
    const key = Object.keys(teacherPageTitles)
        .filter(k => k.endsWith("/") && pathname.startsWith(k))
        .sort((a, b) => b.length - a.length)[0];
    return key ? teacherPageTitles[key] : undefined;
}
