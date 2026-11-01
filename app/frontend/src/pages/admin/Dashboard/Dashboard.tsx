import StatsOverview from "./Components/StatsOverview";
import QuickActions from "../Components/Ui/QuickActions";
import TodayClasses from "./Components/TodayClasses";

export default function AdminDashboard() {
  return <div className="admin-overview">
    <QuickActions actions={[
      { label: "Thêm học viên", to: "/admin/students?action=create", primary: true },
      { label: "Tạo lớp", to: "/admin/classes?action=create" },
      { label: "Tạo phiếu thu", to: "/admin/payments?action=create" },
    ]}/>
    <StatsOverview/>
    <TodayClasses/>
  </div>;
}
