import type { StudentTuitionItem } from "../../../../services/student/useStudentApi";
import './PaymentHistory.css';

interface PaymentHistoryProps {
    items: StudentTuitionItem[]; // Các khoản đã thanh toán (đọc từ BE)
}

const PaymentHistory = ({ items }: PaymentHistoryProps) => {
    // Hàm format tiền tệ VNĐ
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    };

    return (
        <div className="payment-history-container">
            {/* Unified Card: Tiêu đề trang + Bảng lịch sử giao dịch */}
            <div className="payment-table-card">
                <div className="payment-header-section">
                    <div className="payment-icon-box"><i className="fa-solid fa-clock-rotate-left"></i></div>
                    <div className="payment-header-text">
                        <h1>Payment History</h1>
                        <p>Review your past tuition payments and transaction records.</p>
                    </div>
                </div>

                <div className="payment-card-header">Transaction Records</div>
                <div className="payment-table-responsive">
                    <table className="payment-custom-table">
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Course / Class</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Paid Date</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.paymentId}>
                                    <td className="payment-font-medium payment-text-blue">{item.paymentId}</td>
                                    <td>
                                        <div className="payment-font-medium">{item.courseName}</div>
                                        <div className="payment-text-muted" style={{ fontSize: '12px' }}>{item.className}</div>
                                    </td>
                                    <td className="payment-font-medium">{formatCurrency(item.paidAmount ?? 0)}</td>
                                    <td>
                                        <span className={`payment-badge payment-${(item.method ?? 'cash').toLowerCase()}`}>
                                            {item.method ?? 'N/A'}
                                        </span>
                                    </td>
                                    <td className="payment-text-muted">{item.paidDate ?? 'N/A'}</td>
                                    <td className="payment-text-muted">{item.note || 'N/A'}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="payment-text-center payment-text-muted" style={{ padding: '32px' }}>
                                        Chưa có lịch sử giao dịch nào.
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