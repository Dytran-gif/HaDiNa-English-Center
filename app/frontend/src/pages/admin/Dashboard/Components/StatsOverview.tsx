import { Link } from "react-router-dom";
import Icon from "../../Components/Ui/Icon";
import type { IconName } from "../../Components/Ui/types";
import { courses } from "../../../../data/courses";
import { teachers } from "../../../../data/teachers";
import { blogPosts } from "../../../../data/blogPosts";
import { adminMockUsers } from "../../../../data/AdminData/mockUsers";

export default function StatsOverview() {
  const items: { label: string; value: number; to: string; icon: IconName }[] = [
    { label: "Khóa học đang mở", value: courses.length, to: "/admin/courses", icon: "book" },
    { label: "Giáo viên", value: teachers.length, to: "/admin/teachers", icon: "teachers" },
    { label: "Học viên", value: adminMockUsers.filter(user => user.role === "student").length, to: "/admin/students", icon: "students" },
    { label: "Bài viết blog", value: blogPosts.length, to: "/admin/blog", icon: "blog" },
  ];
  return <div className="admin-kpi-grid" aria-label="Tổng quan dữ liệu minh họa">{items.map(item => <Link className="admin-kpi-card" to={item.to} key={item.to}>
    <span className="admin-kpi-icon"><Icon name={item.icon}/></span>
    <strong className="admin-kpi-value">{item.value.toLocaleString("vi-VN")}</strong>
    <span className="admin-kpi-label">{item.label}</span>
  </Link>)}</div>;
}
