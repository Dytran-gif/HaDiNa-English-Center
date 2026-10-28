import type { PageTitle } from "../../types";

export const teacherPageTitles: Record<string, PageTitle> = {
    "/teacher/dashboard": {
        title: "Dashboard",
        subtitle: "Tổng quan lớp học đang phụ trách.",
    },
    "/teacher/classes": {
        title: "Lớp phụ trách",
        subtitle: "Danh sách khóa học bạn đang giảng dạy.",
    },
    "/teacher/schedule": {
        title: "Lịch dạy",
        subtitle: "Lịch học theo tuần của các lớp.",
    },
    "/teacher/profile": {
        title: "Hồ sơ cá nhân",
        subtitle: "Thông tin giáo viên hiển thị công khai.",
    },
    "/teacher/attendance": {
        title: "Điểm danh",
        subtitle: "Điểm danh học viên theo từng buổi học.",
    },
    "/teacher/grades": {
        title: "Bảng điểm",
        subtitle: "Nhập và theo dõi điểm số học viên theo kỹ năng.",
    },
    "/teacher/assignments": {
        title: "Bài tập / Kiểm tra",
        subtitle: "Giao bài tập và theo dõi bài nộp của học viên.",
    },
    "/teacher/materials": {
        title: "Tài liệu giảng dạy",
        subtitle: "Kho tài liệu dùng chung cho các lớp bạn phụ trách.",
    },
};
