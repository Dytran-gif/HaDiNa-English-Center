import type { PageTitle } from "../../types";

export const adminPageTitles: Record<string, PageTitle> = {
    "/admin/consultations": { title: "Yêu cầu tư vấn", subtitle: "Thông tin khách hàng đăng ký tư vấn từ trang chủ." },
    "/admin/profile": { title: "Hồ sơ cá nhân", subtitle: "Thông tin quản trị viên và bảo mật tài khoản." },
    "/admin/teachers": { title: "Quản lý giáo viên", subtitle: "Hồ sơ, lớp phụ trách và tài khoản giáo viên." },
    "/admin/students": { title: "Quản lý học viên", subtitle: "Hồ sơ, ghi danh và lịch sử học phí." },
    "/admin/classes": { title: "Quản lý lớp học", subtitle: "Lịch học, giáo viên, phòng và sĩ số từng lớp." },
    "/admin/settings": { title: "Cài đặt chung", subtitle: "Quản lý thông tin trung tâm." },
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
        subtitle: "Phiếu thu nhiều đợt, đối soát chuyển khoản, công nợ và hoàn tiền.",
    },
    "/admin/reviews": {
        title: "Đánh giá giáo viên",
        subtitle: "Duyệt đánh giá của học viên trước khi hiển thị trên website.",
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
