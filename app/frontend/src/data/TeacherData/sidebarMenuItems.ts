import type { SidebarMenuItem } from "../../types";

export const teacherSidebarMenuItems: SidebarMenuItem[] = [
    { label: "Dashboard", path: "/teacher/dashboard", icon: "⌂" },
    { label: "Lịch dạy", path: "/teacher/schedule", icon: "▣" },
    { label: "Lớp phụ trách", path: "/teacher/classes", icon: "▤" },
    { label: "Điểm danh", path: "/teacher/attendance", icon: "✓" },
    { label: "Học viên", path: "/teacher/students", icon: "☺" },
    { label: "Bài tập", path: "/teacher/assignments", icon: "✎" },
    { label: "Nhận xét", path: "/teacher/feedback", icon: "✉" },
    { label: "Hồ sơ", path: "/teacher/profile", icon: "●" },
];
