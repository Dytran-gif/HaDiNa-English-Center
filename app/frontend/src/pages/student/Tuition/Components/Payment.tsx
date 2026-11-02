import React, { useState, useMemo } from 'react';
import { 
    mockCourses, 
    mockEnrollments, 
    mockClasses 
} from "../../../../data/StudentData/MainData";
import type { Course, ClassItem, Enrollment } from "../../../../types/StudentTypes/MainTypes";
import './Payment.css';

const PaymentFE: React.FC = () => {
    // ID học viên đang đăng nhập (khớp với hệ thống dữ liệu mẫu)
    const currentStudentId = "std-01";

    // Lọc và ánh xạ danh sách các khóa học đã đăng ký thông qua Enrollment -> ClassItem -> Course[cite: 10, 11]
    const studentEnrollments = useMemo(() => {
        return mockEnrollments
            .filter((enr: Enrollment) => enr.studentId === currentStudentId)
            .map((enr: Enrollment) => {
                const classItem = mockClasses.find((c: ClassItem) => c.id === enr.classId);
                const course = classItem ? mockCourses.find((co: Course) => co.id === classItem.courseId) : null;
                return {
                    enrollment: enr,
                    classItem,
                    course,
                    fee: enr.finalTuitionFee ?? course?.tuition ?? 0
                };
            })
            .filter((item): item is { enrollment: Enrollment; classItem: ClassItem; course: Course; fee: number } => 
                item.course !== null && item.classItem !== null
            );
    }, [currentStudentId]);

    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([]);

    const handleSelect = (enrollmentId: string) => {
        setSelectedEnrollmentIds(prev =>
            prev.includes(enrollmentId) ? prev.filter(id => id !== enrollmentId) : [...prev, enrollmentId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedEnrollmentIds(studentEnrollments.map(item => item.enrollment.id));
        } else {
            setSelectedEnrollmentIds([]);
        }
    };

    const totalAmount = useMemo(() => {
        return studentEnrollments
            .filter(item => selectedEnrollmentIds.includes(item.enrollment.id))
            .reduce((sum, item) => sum + item.fee, 0);
    }, [studentEnrollments, selectedEnrollmentIds]);

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
                                        checked={selectedEnrollmentIds.length === studentEnrollments.length && studentEnrollments.length > 0}
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
                            {studentEnrollments.map(({ enrollment, classItem, course, fee }) => (
                                <tr key={enrollment.id}>
                                    <td className="text-center">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={selectedEnrollmentIds.includes(enrollment.id)}
                                            onChange={() => handleSelect(enrollment.id)}
                                        />
                                    </td>
                                    <td className="font-medium">{course.name}</td>
                                    <td className="text-muted">{classItem.name}</td>
                                    <td className="text-muted">{course.bandFrom} - {course.bandTo}</td>
                                    <td className="text-muted">{course.totalSessions} sessions</td>
                                    <td className="font-medium">{formatCurrency(fee)}</td>
                                </tr>
                            ))}
                            {studentEnrollments.length === 0 && (
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
                        onClick={() => alert(`Thanh toán thành công ${formatCurrency(totalAmount)} cho ${selectedEnrollmentIds.length} khóa học!`)}
                    >
                        Payment Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFE;