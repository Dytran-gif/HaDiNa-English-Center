import type { PageTitle } from "../../types";

export const adminPageTitles: Record<string, PageTitle> = {
    "/admin/teachers": { title: "Quản lý giáo viên", subtitle: "Hồ sơ, lớp phụ trách và tài khoản giáo viên." },
    "/admin/students": { title: "Quản lý học viên", subtitle: "Hồ sơ, ghi danh và lịch sử học phí." },
    "/admin/classes": { title: "Quản lý lớp học", subtitle: "Lịch học, giáo viên, phòng và sĩ số từng lớp." },
    "/admin/teacher-requests": { title: "Đơn giáo viên", subtitle: "Duyệt nghỉ, đổi lịch và mở lại điểm danh." },
    "/admin/settings": { title: "Cài đặt chung", subtitle: "Thông tin trung tâm và bảo mật tài khoản." },
    "/admin/dashboard": {
        title: "Dashboard",
        subtitle: "Tổng quan hoạt động trung tâm.",
    },
    "/admin/courses": {
        title: "Quản lý khóa học",
        subtitle: "Xem và quản lý toàn bộ khóa học đang mở.",
    },
    "/admin/users": {
        title: "Quản lý người dùng",
        subtitle: "Danh sách học viên và giáo viên trong hệ thống.",
    },
    "/admin/blog": {
        title: "Quản lý tin tức",
        subtitle: "Xem và quản lý bài viết trên blog.",
    },
    "/admin/payments": {
        title: "Quản lý học phí",
        subtitle: "Theo dõi hóa đơn và trạng thái thanh toán của học viên.",
    },
    "/admin/reports": {
        title: "Báo cáo & thống kê",
        subtitle: "Tổng quan doanh thu và số liệu vận hành trung tâm.",
    },
    "/admin/rooms": {
        title: "Quản lý phòng học",
        subtitle: "Danh sách phòng và sức chứa phục vụ lịch học của lớp.",
    },
};
