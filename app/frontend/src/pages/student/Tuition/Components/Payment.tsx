import { useState, useMemo, useEffect, useRef, type ChangeEvent } from 'react';
import type { StudentTuitionItem } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './Payment.css';

interface PaymentProps {
    items: StudentTuitionItem[]; // Các ghi danh chưa thanh toán (đọc từ BE)
    onPay: (enrollmentIds: number[]) => void; // Hàm thanh toán (gọi BE, lưu phiếu thu xuống DB)
    autoSelectAll?: boolean; // Từ trang Courses: tự tích tất cả khóa khi danh sách tải xong
}

const PaymentFE = ({ items, onPay, autoSelectAll }: PaymentProps) => {
    const { t, money } = useLang();
    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<number[]>([]);
    const autoSelectedRef = useRef(false);

    // Chỉ tự tích một lần sau khi danh sách khóa chưa thanh toán tải xong
    useEffect(() => {
        if (!autoSelectAll || autoSelectedRef.current || items.length === 0) return;
        autoSelectedRef.current = true;
        setSelectedEnrollmentIds(items.map(item => item.enrollmentId));
    }, [autoSelectAll, items]);

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

    return (
        <div className="payment-container">
            {/* Bảng khóa học cần thanh toán */}
            <div className="payment-table-card">
                <div className="payment-card-header">
                    {t("tuition.myCourses")}
                    <span className="payment-card-count">{items.length}</span>
                </div>
                <div className="payment-table-responsive">
                    <table className="payment-custom-table">
                        <thead>
                            <tr>
                                <th className="payment-text-center">
                                    <input
                                        type="checkbox"
                                        className="payment-custom-checkbox"
                                        checked={selectedEnrollmentIds.length === items.length && items.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>{t("tuition.colCourse")}</th>
                                <th>{t("tuition.colClass")}</th>
                                <th>{t("tuition.colLevel")}</th>
                                <th>{t("tuition.colDuration")}</th>
                                <th>{t("tuition.colFee")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.enrollmentId}>
                                    <td className="payment-text-center">
                                        <input
                                            type="checkbox"
                                            className="payment-custom-checkbox"
                                            checked={selectedEnrollmentIds.includes(item.enrollmentId)}
                                            onChange={() => handleSelect(item.enrollmentId)}
                                        />
                                    </td>
                                    <td className="payment-font-medium">{item.courseName}</td>
                                    <td className="payment-text-muted">{item.className}</td>
                                    <td className="payment-text-muted">{item.bandFrom} - {item.bandTo}</td>
                                    <td className="payment-text-muted">{t("common.sessions", { n: item.totalSessions })}</td>
                                    <td className="payment-font-medium">{money(item.finalTuitionFee)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="payment-text-center payment-text-muted" style={{ padding: '32px' }}>
                                        {t("tuition.none")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Card */}
            <div className="payment-summary-card">
                <div className="payment-summary-left">
                    <div className="payment-icon-box-sm"><i className="fa-regular fa-rectangle-list"></i></div>
                    <h2>{t("tuition.summary")}</h2>
                </div>

                <div className="payment-summary-right">
                    <div className="payment-summary-item">
                        <span className="payment-summary-label">{t("tuition.selected")}</span>
                        <span className="payment-summary-value">
                            {t("tuition.courseCount", { n: selectedEnrollmentIds.length })}
                        </span>
                    </div>

                    <div className="payment-summary-item">
                        <span className="payment-summary-label">{t("tuition.total")}</span>
                        <span className="payment-summary-value payment-text-blue">{money(totalAmount)}</span>
                    </div>

                    <button
                        className="payment-btn-primary"
                        disabled={selectedEnrollmentIds.length === 0}
                        onClick={() => onPay(selectedEnrollmentIds)}
                    >
                        {t("my.payNow")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFE;