import { Link } from "react-router-dom";
import Icon from "../../Components/Ui/Icon";
import type { IconName } from "../../Components/Ui/types";
import Button from "../../Components/Ui/Button";
import Notice from "../../Components/Ui/Notice";
import { money } from "../../Components/Api/adminFormat";
import { useAdminQuery } from "../../../../services/admin/useAdminApi";
import type { DashboardKpisResponse } from "../../../../types/adminApi";

export default function StatsOverview() {
  const { data, loading, error, reload } = useAdminQuery<DashboardKpisResponse>("dashboard/kpis");
  const items: { label: string; value: number | undefined; to: string; icon: IconName; currency?: boolean }[] = [
    { label: "Học viên đang học", value: data?.activeStudents, to: "/admin/students?status=Studying", icon: "students" },
    { label: "Lớp đang mở", value: data?.openClasses, to: "/admin/classes", icon: "classes" },
    { label: "Giáo viên", value: data?.teachers, to: "/admin/teachers", icon: "teachers" },
    { label: "Doanh thu tháng này", value: data?.monthlyRevenue, to: "/admin/reports", icon: "payments", currency: true },
  ];
  return <>
    {error && <Notice tone="error" title="Không tải được số liệu" action={<Button onClick={reload}>Thử lại</Button>}>{error}</Notice>}
    <div className="admin-kpi-grid" aria-label="Tổng quan trung tâm" aria-busy={loading}>
      {items.map(item => <Link className="admin-kpi-card" to={item.to} key={item.to}>
        <span className="admin-kpi-icon"><Icon name={item.icon}/></span>
        <strong className="admin-kpi-value">{loading ? <span className="admin-skeleton-line" aria-label="Đang tải"/> : item.value === undefined ? "--" : item.currency ? money(item.value) : item.value.toLocaleString("vi-VN")}</strong>
        <span className="admin-kpi-label">{item.label}</span>
      </Link>)}
    </div>
  </>;
}
