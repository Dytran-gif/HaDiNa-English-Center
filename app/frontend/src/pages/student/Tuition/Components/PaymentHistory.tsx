import type { StudentTuitionItem } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import "./PaymentHistory.css";
import "../../StudentExtra.css";

interface PaymentHistoryProps {
    items: StudentTuitionItem[]; // mọi khoản học phí kèm các phiếu (thu nhiều đợt, chờ xác nhận, hoàn)
}

// Lịch sử thanh toán: mỗi phiếu một dòng, có số biên lai, trạng thái (chờ xác nhận / đã xác nhận / bị từ chối / đã hủy / hoàn tiền)
export default function PaymentHistory({ items }: PaymentHistoryProps) {
    const { t, money, date } = useLang();
    const rows = items.flatMap(i => i.payments.map(p => ({ ...p, classCode: i.classCode, courseName: i.courseName })))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (rows.length === 0) {
        return <div className="sx-empty">{t("payHistory.empty")}</div>;
    }

    return (
        <div className="sx-panel" style={{ overflowX: "auto" }}>
            <table className="sx-table">
                <thead>
                    <tr>
                        <th>{t("sx.receiptNo")}</th>
                        <th>{t("sx.classCode")}</th>
                        <th>{t("sx.date")}</th>
                        <th>{t("sx.method")}</th>
                        <th>{t("sx.statusCol")}</th>
                        <th className="is-money">{t("sx.amountCol")}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(p => (
                        <tr key={p.id}>
                            <td>{p.receiptNo ?? <span className="sx-muted">—</span>}</td>
                            <td><span className="sx-code">{p.classCode}</span><div className="sx-muted">{p.courseName}</div></td>
                            <td>{date(p.paidDate)}</td>
                            <td>{p.method === "Transfer" ? t("sx.transfer") : t("sx.cash")}{p.transferRef ? <div className="sx-muted">{p.transferRef}</div> : null}</td>
                            <td>
                                <span className={`sx-chip is-${p.kind === "Refund" ? "refunded" : p.status.toLowerCase()}`}>
                                    {p.kind === "Refund" ? t("sx.refund") : t(`sx.pstatus.${p.status}`)}
                                </span>
                                {p.cancelReason && <div className="sx-muted">{p.cancelReason}</div>}
                            </td>
                            <td className="is-money" style={{ fontWeight: 700, color: p.kind === "Refund" ? "#5b21b6" : undefined }}>
                                {p.kind === "Refund" ? "−" : ""}{money(p.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
