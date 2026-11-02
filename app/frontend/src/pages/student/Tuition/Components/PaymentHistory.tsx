import React from 'react';
import { mockPayments } from "../../../../data/StudentData/MainData";
import type { Payment } from "../../../../types/StudentTypes/MainTypes";
import './PaymentHistory.css';

const PaymentHistory: React.FC = () => {
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
                                <th>Enrollment ID</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Paid Date</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockPayments.map((pay: Payment) => (
                                <tr key={pay.id}>
                                    <td className="font-medium text-blue">{pay.id}</td>
                                    <td className="text-muted">{pay.enrollmentId}</td>
                                    <td className="font-medium">{formatCurrency(pay.amount)}</td>
                                    <td>
                                        <span className={`badge ${pay.method.toLowerCase()}`}>
                                            {pay.method}
                                        </span>
                                    </td>
                                    <td className="text-muted">{pay.paidDate}</td>
                                    <td className="text-muted">{pay.note || 'N/A'}</td>
                                </tr>
                            ))}
                            {mockPayments.length === 0 && (
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