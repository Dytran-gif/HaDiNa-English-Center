
import type { StudentEnrollmentItem } from '../../../../services/student/useStudentApi';
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import { useLang } from "../../../../i18n/LanguageContext";
import './CourseBottom.css';

interface CourseBottomProps {
    enrolledCourses: StudentEnrollmentItem[]; // Các khóa học viên đã đăng ký (đọc từ DB)
    onDelete: (enrollmentId: number) => void; // Hàm hủy ghi danh (xóa trong DB)
    onGoTuition: () => void; // Hàm điều hướng sang trang học phí
    onBrowse: () => void; // Chuyển sang tab Browse Courses khi chưa có khóa nào
}

export default function CourseBottomFE({ enrolledCourses, onDelete, onGoTuition, onBrowse }: CourseBottomProps) {
    const { t, money } = useLang();

    // Chưa đăng ký khóa nào -> empty state kèm nút sang tab Browse Courses
    if (enrolledCourses.length === 0) {
        return (
            <div className="cb-empty">
                <div className="cb-empty-icon">
                    <i className="fa-solid fa-book-open"></i>
                </div>
                <h3>{t("my.emptyTitle")}</h3>
                <p>{t("my.emptyDesc")}</p>
                <button className="cb-browse-btn" onClick={onBrowse}>
                    <i className="fa-solid fa-compass"></i> {t("my.browse")}
                </button>
            </div>
        );
    }

    // Học phí lấy từ snapshot lúc ghi danh (BE trả về); nếu BE cũ thiếu field thì tính lại đúng như BE
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const baseFee = (item: StudentEnrollmentItem) => item.tuitionFee ?? item.course.tuition;
    const pctOf = (item: StudentEnrollmentItem) => item.discountPercent ?? item.course.discountPercent;
    const discFee = (item: StudentEnrollmentItem) =>
        item.discountAmount ?? round2(baseFee(item) * pctOf(item) / 100);
    const finalFee = (item: StudentEnrollmentItem) => item.finalTuitionFee ?? baseFee(item) - discFee(item);

    // Tổng tiền chỉ tính các khóa CHƯA thanh toán (khóa đã đóng tiền không cộng nữa)
    const unpaidCourses = enrolledCourses.filter(item => !item.isPaid);
    const totalBase = unpaidCourses.reduce((sum, item) => sum + baseFee(item), 0);
    const totalDiscount = unpaidCourses.reduce((sum, item) => sum + discFee(item), 0);
    const totalFinal = unpaidCourses.reduce((sum, item) => sum + finalFee(item), 0);
    const hasUnpaid = unpaidCourses.length > 0;

    return (
        <section className="course-bottom-section">
            {/* Cột trái: Danh sách các khóa học đã đăng ký */}
            <div className="cb-left-panel">
                <h3 className="cb-panel-title">
                    <i className="fa-solid fa-book-bookmark"></i>
                    {t("my.title", { n: enrolledCourses.length })}
                </h3>
                
                {/* Danh sách có thanh trượt nếu quá 10 item */}
                <div className="cb-list-wrapper">
                    {enrolledCourses.map((item) => (
                        <div key={item.enrollmentId} className="cb-course-item">
                            
                            {/* 1. Thông tin khóa học */}
                            <div className="cb-course-info">
                                <img 
                                    src={item.course.imageUrl || defaultCourseImage} 
                                    alt={item.course.name} 
                                    className="cb-img" 
                                />
                                <div className="cb-info-text">
                                    <span className="cb-level badge-beginner">
                                        Band {item.course.bandFrom} - {item.course.bandTo}
                                    </span>
                                    {item.isPaid && (
                                        <span className="cb-paid-badge">{t("my.paid")}</span>
                                    )}
                                    <h4 className="cb-title">{item.course.name}</h4>
                                    <div className="cb-meta">
                                        <span><i className="fa-regular fa-clock"></i> {t("common.sessions", { n: item.course.totalSessions })}</span>
                                        <span className="cb-price-item">
                                            {discFee(item) > 0 && <s className="cb-price-original">{money(baseFee(item))}</s>}
                                            <span className="cb-price-final">{money(finalFee(item))}</span>
                                            {discFee(item) > 0 && (
                                                <span className="cb-discount-chip">-{pctOf(item)}%</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 3. Nút Xóa khóa học (khóa đã thanh toán thì không cho xóa) */}
                            {!item.isPaid && (
                                <button 
                                    className="cb-delete-btn" 
                                    onClick={() => onDelete(item.enrollmentId)}
                                    title={t("my.remove")}
                                >
                                    <i className="fa-regular fa-trash-can"></i>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Cột phải: Tổng tiền và Nút thanh toán */}
            <div className="cb-right-panel">
                <div className="cb-summary-card">
                    {totalDiscount > 0 && (
                        <div className="cb-summary-breakdown">
                            <div>
                                <span>{t("my.original")}</span>
                                <strong>{money(totalBase)}</strong>
                            </div>
                            <div className="cb-summary-discount-row">
                                <span>{t("my.discount")}</span>
                                <strong>-{money(totalDiscount)}</strong>
                            </div>
                        </div>
                    )}
                    <span className="cb-summary-label">{t("my.due")}</span>
                    <span className="cb-summary-price">{money(totalFinal)}</span>
                    {hasUnpaid ? (
                        <>
                            <button className="cb-register-btn" onClick={onGoTuition}>{t("my.payNow")}</button>
                            <p className="cb-summary-note">
                                {t("my.payNote")}
                            </p>
                        </>
                    ) : (
                        <p className="cb-summary-note">
                            {t("my.allPaid")}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
