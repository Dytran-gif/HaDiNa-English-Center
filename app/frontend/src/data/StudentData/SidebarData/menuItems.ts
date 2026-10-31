import type { SidebarMenuItem } from "../../../types";

export const sidebarMenuItems: SidebarMenuItem[] = [
    {
        label: "Dashboard",
        path: "/student/dashboard",
        icon: "fa-solid fa-house",
    },
    {
        label: "Schedule",
        path: "/student/schedule",
        icon: "fa-solid fa-calendar-check"
    },
    {
        label: "Courses",
        path: "/student/courses",
        icon: "fa-solid fa-book-open",
    },
    {
        label: "Feedback",
        path: "/student/feedback",
        icon: "fa-solid fa-comment-dots",
    },
    {
        label: "Tuition",
        path: "/student/tuition",
        icon: "fa-solid fa-money-check-dollar",
    },
];