import type { SidebarMenuItem } from "../../types";

export const teacherSidebarMenuItems: SidebarMenuItem[] = [
    { label: "Dashboard", path: "/teacher/dashboard", icon: "⌂" },
    { label: "Lớp phụ trách", path: "/teacher/classes", icon: "▤" },
    { label: "Điểm danh", path: "/teacher/attendance", icon: "✓" },
    { label: "Bảng điểm", path: "/teacher/grades", icon: "★" },
    { label: "Bài tập", path: "/teacher/assignments", icon: "✎" },
    { label: "Tài liệu", path: "/teacher/materials", icon: "▥" },
    { label: "Lịch dạy", path: "/teacher/schedule", icon: "▣" },
    { label: "Hồ sơ", path: "/teacher/profile", icon: "●" },
];
