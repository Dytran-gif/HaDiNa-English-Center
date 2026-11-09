import type { SidebarMenuItem } from "../../types";

export const teacherSidebarMenuItems: SidebarMenuItem[] = [
    { label: "Dashboard", path: "/teacher/dashboard", icon: "⌂" },
    { label: "Lịch dạy", path: "/teacher/schedule", icon: "▣" },
    { label: "Lớp phụ trách", path: "/teacher/classes", icon: "▤" },
    { label: "Điểm danh", path: "/teacher/attendance", icon: "✓" },
    { label: "Bài tập", path: "/teacher/assignments", icon: "✎" },
    { label: "Chấm bài", path: "/teacher/grading", icon: "✍" },
    { label: "Kiểm tra & Sổ điểm", path: "/teacher/grades", icon: "★" },
    { label: "Học viên", path: "/teacher/students", icon: "☺" },
    { label: "Yêu cầu & Thông báo", path: "/teacher/requests", icon: "✉" },
    { label: "Tài liệu", path: "/teacher/materials", icon: "▥" },
    { label: "Hồ sơ", path: "/teacher/profile", icon: "●" },
];
