import React, { useMemo } from 'react';
import { 
    mockPayments, 
    mockEnrollments, 
    mockClasses, 
    mockCourses 
} from "../../../../data/StudentData/MainData";
import type { Payment, Enrollment, ClassItem, Course } from "../../../../types/StudentTypes/MainTypes";
import './PaymentHistory.css';

const PaymentHistory: React.FC = () => {
    // ID học viên đang đăng nhập (khớp với hệ thống dữ liệu mẫu)
    const currentStudentId = "std-01";

    // Lọc và ánh xạ lịch sử thanh toán của riêng học viên thông qua Enrollment -> ClassItem -> Course
    const studentPayments = useMemo(() => {
        // Lấy danh sách ID enrollment thuộc về học viên hiện tại
        const studentEnrollmentIds = mockEnrollments
            .filter((enr: Enrollment) => enr.studentId === currentStudentId)
            .map((enr: Enrollment) => enr.id);

        // Lọc các bản ghi thanh toán khớp với danh sách enrollment trên
        return mockPayments
            .filter((pay: Payment) => studentEnrollmentIds.includes(pay.enrollmentId))
            .map((pay: Payment) => {
                const enrollment = mockEnrollments.find((enr: Enrollment) => enr.id === pay.enrollmentId);
                const classItem = enrollment ? mockClasses.find((c: ClassItem) => c.id === enrollment.classId) : null;
                const course = classItem ? mockCourses.find((co: Course) => co.id === classItem.courseId) : null;

                return {
                    payment: pay,
                    courseName: course ? course.name : 'N/A',
                    className: classItem ? classItem.name : 'N/A'
                };
            });
    }, [currentStudentId]);

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
                            {studentPayments.map(({ payment, courseName, className }) => (
                                <tr key={payment.id}>
                                    <td className="font-medium text-blue">{payment.id}</td>
                                    <td>
                                        <div className="font-medium">{courseName}</div>
                                        <div className="text-muted" style={{ fontSize: '12px' }}>{className}</div>
                                    </td>
                                    <td className="font-medium">{formatCurrency(payment.amount)}</td>
                                    <td>
                                        <span className={`badge ${payment.method.toLowerCase()}`}>
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td className="text-muted">{payment.paidDate}</td>
                                    <td className="text-muted">{payment.note || 'N/A'}</td>
                                </tr>
                            ))}
                            {studentPayments.length === 0 && (
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