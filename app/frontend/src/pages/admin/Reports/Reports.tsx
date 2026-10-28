import "../admin-shared.css";
import "../Dashboard/Dashboard.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import StatBlock from "../../../components/ui/StatBlock";
import { adminPayments } from "../../../data/AdminData/payments";
import { adminMockUsers } from "../../../data/AdminData/mockUsers";
import { courses, formatPrice } from "../../../data/courses";
import { useLocalCollection } from "../../../hooks/useLocalCollection";
import type { Payment } from "../../../types";

function monthKey(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
}

function buildRevenueByMonth(payments: Payment[]) {
    const map = new Map<string, number>();
    payments
        .filter((p) => p.status === "paid" && p.paid_date)
        .forEach((p) => {
            const key = monthKey(p.paid_date as string);
            map.set(key, (map.get(key) ?? 0) + p.amount);
        });
    return Array.from(map.entries()).sort((a, b) => {
        const [ma, ya] = a[0].split("/").map(Number);
        const [mb, yb] = b[0].split("/").map(Number);
        return ya === yb ? ma - mb : ya - yb;
    });
}

function downloadCsv(rows: (string | number)[][], filename: string) {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function Reports() {
    const { items: payments } = useLocalCollection<Payment>("admin_payments", adminPayments);

    const revenueByMonth = buildRevenueByMonth(payments);
    const maxRevenue = Math.max(1, ...revenueByMonth.map(([, v]) => v));

    const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const totalOutstanding = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
    const studentCount = adminMockUsers.filter((u) => u.role === "student").length;

    function handleExportRevenue() {
        const rows: (string | number)[][] = [["Tháng", "Doanh thu (VNĐ)"]];
        revenueByMonth.forEach(([m, v]) => rows.push([m, v]));
        downloadCsv(rows, "bao-cao-doanh-thu.csv");
    }

    function handleExportPayments() {
        const rows: (string | number)[][] = [["Mã hóa đơn", "Học viên", "Khóa học", "Số tiền", "Trạng thái", "Hạn thanh toán"]];
        payments.forEach((p) => {
            const user = adminMockUsers.find((u) => u.user_id === p.user_id)?.full_name ?? `#${p.user_id}`;
            const course = courses.find((c) => c.course_id === p.course_id)?.course_name ?? `#${p.course_id}`;
            rows.push([p.payment_id, user, course, p.amount, p.status, p.due_date]);
        });
        downloadCsv(rows, "bao-cao-hoa-don.csv");
    }

    return (
        <div className="admin-table-page">
            <div className="admin-stats-grid admin-stats-grid--three">
                <Card>
                    <StatBlock value={formatPrice(totalRevenue)} label="Tổng doanh thu đã thu" />
                </Card>
                <Card>
                    <StatBlock value={formatPrice(totalOutstanding)} label="Công nợ chưa thu" />
                </Card>
                <Card>
                    <StatBlock value={String(studentCount)} label="Học viên đang theo học" />
                </Card>
            </div>

            <Card className="admin-recent-card">
                <div className="admin-recent-header">
                    <h2>Doanh thu theo tháng</h2>
                    <Button variant="outline" onClick={handleExportRevenue}>
                        Xuất CSV
                    </Button>
                </div>
                {revenueByMonth.length === 0 ? (
                    <p style={{ color: "var(--muted)" }}>Chưa có dữ liệu doanh thu.</p>
                ) : (
                    <div className="admin-bar-chart">
                        {revenueByMonth.map(([month, value]) => (
                            <div className="admin-bar-chart__col" key={month}>
                                <span className="admin-bar-chart__value">{formatPrice(value)}</span>
                                <div
                                    className="admin-bar-chart__bar"
                                    style={{ height: `${Math.max(6, (value / maxRevenue) * 160)}px` }}
                                />
                                <span className="admin-bar-chart__label">{month}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card className="admin-recent-card" style={{ marginTop: 20 }}>
                <div className="admin-recent-header">
                    <h2>Xuất báo cáo chi tiết</h2>
                    <Button variant="outline" onClick={handleExportPayments}>
                        Xuất danh sách hóa đơn (CSV)
                    </Button>
                </div>
                <p style={{ color: "var(--muted)", margin: 0 }}>
                    Xuất toàn bộ {payments.length} hóa đơn kèm trạng thái thanh toán để đối soát ngoài hệ thống.
                </p>
            </Card>
        </div>
    );
}
