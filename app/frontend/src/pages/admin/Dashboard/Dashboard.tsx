import StatsOverview from "./Components/StatsOverview";
import Button from "../Components/Ui/Button";
import Badge from "../Components/Ui/Badge";
import QuickActions from "../Components/Ui/QuickActions";
import SectionCard from "../Components/Ui/SectionCard";
import { courses } from "../../../data/courses";

export default function AdminDashboard() {
  const recentCourses = courses.slice(0, 5);
  return <div className="admin-overview">
    <QuickActions actions={[
      { label: "Thêm học viên", to: "/admin/students?action=create", primary: true },
      { label: "Tạo lớp", to: "/admin/classes?action=create" },
      { label: "Tạo phiếu thu", to: "/admin/payments?action=create" },
    ]}/>
    <StatsOverview/>
    <SectionCard title="Khóa học gần đây" action={<Button to="/admin/courses" variant="ghost">Xem tất cả</Button>}>
      <ul className="admin-summary-list">{recentCourses.map(course => <li key={course.course_id}><span>{course.course_name}</span><Badge tone="neutral">{course.level}</Badge></li>)}</ul>
    </SectionCard>
  </div>;
}
