import React, { useState, useMemo } from 'react';
import { mockCourses } from "../../../../data/StudentData/MainData";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import './Payment.css';

const PaymentFE: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(mockCourses.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const totalAmount = useMemo(() => {
        return mockCourses
            .filter(c => selectedIds.includes(c.id))
            .reduce((sum, c) => sum + c.tuition, 0);
    }, [selectedIds]);

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
                                        checked={selectedIds.length === mockCourses.length && mockCourses.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Course Name</th>
                                <th>Level</th>
                                <th>Duration</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCourses.map((course: Course) => (
                                <tr key={course.id}>
                                    <td className="text-center">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={selectedIds.includes(course.id)}
                                            onChange={() => handleSelect(course.id)}
                                        />
                                    </td>
                                    <td className="font-medium">{course.name}</td>
                                    <td className="text-muted">{course.bandFrom} - {course.bandTo}</td>
                                    <td className="text-muted">{course.totalSessions} sessions</td>
                                    <td className="font-medium">{formatCurrency(course.tuition)}</td>
                                </tr>
                            ))}
                            {mockCourses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-muted">
                                        Không có khóa học nào.
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
                            {selectedIds.length} course{selectedIds.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="summary-item">
                        <span className="summary-label">Total Amount</span>
                        <span className="summary-value text-blue">{formatCurrency(totalAmount)}</span>
                    </div>

                    <button
                        className="btn-primary"
                        disabled={selectedIds.length === 0}
                        onClick={() => alert(`Thanh toán thành công ${formatCurrency(totalAmount)} cho ${selectedIds.length} khóa học!`)}
                    >
                        Payment Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFE;