import type { StudentTuitionItem } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './PaymentHistory.css';

interface PaymentHistoryProps {
    items: StudentTuitionItem[]; // Các khoản đã thanh toán (đọc từ BE)
}

const PaymentHistory = ({ items }: PaymentHistoryProps) => {
    const { t, money } = useLang();

    return (
        <div className="payment-history-container">
            <div className="payment-table-card">
                <div className="payment-card-header">{t("payHistory.records")}</div>
                <div className="payment-table-responsive">
                    <table className="payment-custom-table">
                        <thead>
                            <tr>
                                <th>{t("payHistory.colCourse")}</th>
                                <th>{t("payHistory.colAmount")}</th>
                                <th>{t("payHistory.colMethod")}</th>
                                <th>{t("payHistory.colDate")}</th>
                                <th>{t("payHistory.colNote")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.paymentId}>
                                    <td>
                                        <div className="payment-font-medium">{item.courseName}</div>
                                        <div className="payment-text-muted" style={{ fontSize: '12px' }}>{item.className}</div>
                                    </td>
                                    <td className="payment-font-medium">{money(item.paidAmount ?? 0)}</td>
                                    <td>
                                        <span className={`payment-badge payment-${(item.method ?? 'cash').toLowerCase()}`}>
                                            {item.method ? t(`method.${item.method.toLowerCase()}`) : t("method.cash")}
                                        </span>
                                    </td>
                                    <td className="payment-text-muted">{item.paidDate ?? '—'}</td>
                                    <td className="payment-text-muted">{item.note || '—'}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="payment-text-center payment-text-muted" style={{ padding: '32px' }}>
                                        {t("payHistory.empty")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;