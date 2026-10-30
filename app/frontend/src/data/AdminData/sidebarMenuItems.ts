import type { SidebarMenuItem } from "../../types";

// Menu Admin — dựa theo User Tree đã chốt: Quản lý khóa học / người dùng / tin tức
export const adminSidebarMenuItems: SidebarMenuItem[] = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "⌂" },
    { label: "Khóa học", path: "/admin/courses", icon: "▤" },
    { label: "Giáo viên", path: "/admin/teachers", icon: "◈" },
    { label: "Học viên", path: "/admin/students", icon: "◎" },
    { label: "Lớp học", path: "/admin/classes", icon: "▤" },
    { label: "Đơn giáo viên", path: "/admin/teacher-requests", icon: "☷" },
    { label: "Tin tức / Blog", path: "/admin/blog", icon: "✎" },
    { label: "Học phí", path: "/admin/payments", icon: "$" },
    { label: "Báo cáo", path: "/admin/reports", icon: "▦" },
    { label: "Phòng học", path: "/admin/rooms", icon: "▢" },
    { label: "Cài đặt chung", path: "/admin/settings", icon: "⚙" },
];
