import { useState, useMemo, type ChangeEvent } from 'react';
import type { StudentTuitionItem } from "../../../../services/student/useStudentApi";
import './Payment.css';

interface PaymentProps {
    items: StudentTuitionItem[]; // Các ghi danh chưa thanh toán (đọc từ BE)
    onPay: (enrollmentIds: number[]) => void; // Hàm thanh toán (gọi BE, lưu phiếu thu xuống DB)
}

const PaymentFE = ({ items, onPay }: PaymentProps) => {
    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<number[]>([]);

    const handleSelect = (enrollmentId: number) => {
        setSelectedEnrollmentIds(prev =>
            prev.includes(enrollmentId) ? prev.filter(id => id !== enrollmentId) : [...prev, enrollmentId]
        );
    };

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedEnrollmentIds(items.map(item => item.enrollmentId));
        } else {
            setSelectedEnrollmentIds([]);
        }
    };

    const totalAmount = useMemo(() => {
        return items
            .filter(item => selectedEnrollmentIds.includes(item.enrollmentId))
            .reduce((sum, item) => sum + item.finalTuitionFee, 0);
    }, [items, selectedEnrollmentIds]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    };

    return (
        <div className="payment-container">
            {/* Header */}
            <div className="header-section">
                <div className="icon-box"><i className="fa-solid fa-file-invoice-dollar"></i></div>
                <div className="header-text">
                    <h1>Tuition</h1>
                    <p>Select courses to review and pay your tuition fees.</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="table-card">
                <div className="card-header">My Courses</div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th className="text-center">
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox"
                                        checked={selectedEnrollmentIds.length === items.length && items.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Course Name</th>
                                <th>Class</th>
                                <th>Level</th>
                                <th>Duration</th>
                                <th>Tuition Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.enrollmentId}>
                                    <td className="text-center">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={selectedEnrollmentIds.includes(item.enrollmentId)}
                                            onChange={() => handleSelect(item.enrollmentId)}
                                        />
                                    </td>
                                    <td className="font-medium">{item.courseName}</td>
                                    <td className="text-muted">{item.className}</td>
                                    <td className="text-muted">{item.bandFrom} - {item.bandTo}</td>
                                    <td className="text-muted">{item.totalSessions} sessions</td>
                                    <td className="font-medium">{formatCurrency(item.finalTuitionFee)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted">
                                        Không có khóa học nào cần thanh toán.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Card */}
            <div className="summary-card">
                <div className="summary-left">
                    <div className="icon-box-sm"><i className="fa-regular fa-rectangle-list"></i></div>
                    <h2>Payment Summary</h2>
                </div>

                <div className="summary-right">
                    <div className="summary-item">
                        <span className="summary-label">Selected Courses</span>
                        <span className="summary-value">
                            {selectedEnrollmentIds.length} course{selectedEnrollmentIds.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="summary-item">
                        <span className="summary-label">Total Amount</span>
                        <span className="summary-value text-blue">{formatCurrency(totalAmount)}</span>
                    </div>

                    <button
                        className="btn-primary"
                        disabled={selectedEnrollmentIds.length === 0}
                        onClick={() => onPay(selectedEnrollmentIds)}
                    >
                        Payment Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFE;