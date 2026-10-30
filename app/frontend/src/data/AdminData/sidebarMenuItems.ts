import type { SidebarMenuItem } from "../../types";
import type { IconName } from "../../pages/admin/Components/Ui/types";
interface AdminMenuGroup { label: string; items: { label: string; path: string; icon: IconName }[] }
export const adminSidebarMenuGroups: AdminMenuGroup[] = [
  { label: "Tổng quan", items: [
    { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
    { label: "Báo cáo", path: "/admin/reports", icon: "reports" },
  ] },
  { label: "Đào tạo", items: [
    { label: "Khóa học", path: "/admin/courses", icon: "book" },
    { label: "Lớp học", path: "/admin/classes", icon: "classes" },
    { label: "Giáo viên", path: "/admin/teachers", icon: "teachers" },
    { label: "Học viên", path: "/admin/students", icon: "students" },
    { label: "Đơn giáo viên", path: "/admin/teacher-requests", icon: "requests" },
  ] },
  { label: "Nội dung", items: [
    { label: "Tin tức / Blog", path: "/admin/blog", icon: "blog" },
  ] },
  { label: "Tài chính", items: [
    { label: "Học phí", path: "/admin/payments", icon: "payments" },
  ] },
  { label: "Hệ thống", items: [
    { label: "Phòng học", path: "/admin/rooms", icon: "rooms" },
    { label: "Cài đặt chung", path: "/admin/settings", icon: "settings" },
  ] },
];
// Preserve the old export for callers that need a flat route list.
export const adminSidebarMenuItems: SidebarMenuItem[] = adminSidebarMenuGroups.flatMap(group => group.items);
