import "../admin-shared.css";
import "../Dashboard/Dashboard.css";
import "./Reports.css";
import Card from "../../../components/ui/Card";
import Button from "../Components/Ui/Button";
import Notice from "../Components/Ui/Notice";
import StatBlock from "../../../components/ui/StatBlock";
import { money } from "../Components/Api/adminFormat";
import { useAdminQuery } from "../../../services/admin/useAdminApi";
import type { DashboardKpisResponse, RevenueMonthResponse } from "../../../types/adminApi";

function monthLabel(month: string) { return month.split("-").reverse().join("/"); }
function downloadRevenue(items: RevenueMonthResponse[]) {
  const rows = [["Tháng", "Doanh thu (VNĐ)"], ...items.map(item => [monthLabel(item.month), item.revenue])];
  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url; link.download = "bao-cao-doanh-thu.csv";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function Reports() {
  const summary = useAdminQuery<DashboardKpisResponse>("dashboard/kpis");
  const revenue = useAdminQuery<RevenueMonthResponse[]>("dashboard/revenue-by-month?months=12");
  const items = revenue.data ?? [];
  const maxRevenue = Math.max(1, ...items.map(item => item.revenue));
  return <div className="admin-table-page">
    {summary.error && <Notice tone="error" title="Không tải được tổng quan" action={<Button onClick={summary.reload}>Thử lại</Button>}>{summary.error}</Notice>}
    <div className="admin-stats-grid admin-reports-stats" aria-busy={summary.loading}>
      <Card><StatBlock value={summary.loading ? "Đang tải…" : summary.data ? money(summary.data.totalRevenue) : "--"} label="Tổng doanh thu đã thu"/></Card>
      <Card><StatBlock value={summary.loading ? "Đang tải…" : summary.data ? summary.data.activeStudents.toLocaleString("vi-VN") : "--"} label="Học viên đang theo học"/></Card>
    </div>
    <Card className="admin-recent-card">
      <div className="admin-recent-header"><h2>Doanh thu 12 tháng gần nhất</h2><Button onClick={() => downloadRevenue(items)} disabled={revenue.loading || Boolean(revenue.error) || items.length === 0}>Xuất CSV</Button></div>
      {revenue.error ? <Notice tone="error" title="Không tải được doanh thu" action={<Button onClick={revenue.reload}>Thử lại</Button>}>{revenue.error}</Notice> : revenue.loading ? <p role="status">Đang tải doanh thu…</p> : items.length === 0 ? <p>Chưa có dữ liệu doanh thu.</p> :
        <div className="admin-revenue-scroll" role="region" aria-label="Biểu đồ doanh thu 12 tháng, có thể cuộn ngang" tabIndex={0}><div className="admin-bar-chart" aria-label="Doanh thu theo tháng">{items.map(item => <div className="admin-bar-chart__col" key={item.month}>
          <span className="admin-bar-chart__value">{money(item.revenue)}</span>
          <div className="admin-bar-chart__bar" style={{ height: `${item.revenue / maxRevenue * 160}px` }} aria-hidden="true"/>
          <span className="admin-bar-chart__label">{monthLabel(item.month)}</span>
        </div>)}</div></div>}
    </Card>
  </div>;
}
