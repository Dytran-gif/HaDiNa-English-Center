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
        <div className="history-container">
            {/* Tiêu đề trang */}
            <div className="header-section">
                <div className="icon-box"><i className="fa-solid fa-clock-rotate-left"></i></div>
                <div className="header-text">
                    <h1>Payment History</h1>
                    <p>Review your past tuition payments and transaction records.</p>
                </div>
            </div>

            {/* Bảng lịch sử giao dịch */}
            <div className="table-card">
                <div className="card-header">Transaction Records</div>
                <div className="table-responsive">
                    <table className="custom-table">
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
                                    <td className="font-medium text-blue">{item.paymentId}</td>
                                    <td>
                                        <div className="font-medium">{item.courseName}</div>
                                        <div className="text-muted" style={{ fontSize: '12px' }}>{item.className}</div>
                                    </td>
                                    <td className="font-medium">{formatCurrency(item.paidAmount ?? 0)}</td>
                                    <td>
                                        <span className={`badge ${(item.method ?? 'cash').toLowerCase()}`}>
                                            {item.method ?? 'N/A'}
                                        </span>
                                    </td>
                                    <td className="text-muted">{item.paidDate ?? 'N/A'}</td>
                                    <td className="text-muted">{item.note || 'N/A'}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted">
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