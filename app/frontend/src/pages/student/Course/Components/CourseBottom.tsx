
import type { StudentEnrollmentItem } from '../../../../services/student/useStudentApi';
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import './CourseBottom.css';

interface CourseBottomProps {
    enrolledCourses: StudentEnrollmentItem[]; // Các khóa học viên đã đăng ký (đọc từ DB)
    onDelete: (enrollmentId: number) => void; // Hàm hủy ghi danh (xóa trong DB)
    onGoTuition: () => void; // Hàm điều hướng sang trang học phí
    onBrowse: () => void; // Chuyển sang tab Browse Courses khi chưa có khóa nào
}

export default function CourseBottomFE({ enrolledCourses, onDelete, onGoTuition, onBrowse }: CourseBottomProps) {
    // Chưa đăng ký khóa nào -> empty state kèm nút sang tab Browse Courses
    if (enrolledCourses.length === 0) {
        return (
            <div className="cb-empty">
                <div className="cb-empty-icon">
                    <i className="fa-solid fa-book-open"></i>
                </div>
                <h3>Bạn chưa đăng ký khóa học nào</h3>
                <p>Khám phá các chương trình của trung tâm và chọn khóa phù hợp với mục tiêu của bạn.</p>
                <button className="cb-browse-btn" onClick={onBrowse}>
                    <i className="fa-solid fa-compass"></i> Browse Courses
                </button>
            </div>
        );
    }

    // Tổng tiền chỉ tính các khóa CHƯA thanh toán (khóa đã đóng tiền không cộng nữa)
    const totalPrice = enrolledCourses
        .filter(item => !item.isPaid)
        .reduce((sum, item) => sum + item.course.tuition, 0);

    const hasUnpaid = enrolledCourses.some(item => !item.isPaid);

    return (
        <section className="course-bottom-section">
            {/* Cột trái: Danh sách các khóa học đã đăng ký */}
            <div className="cb-left-panel">
                <h3 className="cb-panel-title">
                    <i className="fa-solid fa-book-bookmark"></i>
                    Registered Courses ({enrolledCourses.length})
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
                                        <span className="cb-paid-badge">Đã thanh toán</span>
                                    )}
                                    <h4 className="cb-title">{item.course.name}</h4>
                                    <div className="cb-meta">
                                        <span><i className="fa-regular fa-clock"></i> {item.course.totalSessions} sessions</span>
                                        <span className="cb-price-item">{item.course.tuition.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 3. Nút Xóa khóa học (khóa đã thanh toán thì không cho xóa) */}
                            {!item.isPaid && (
                                <button 
                                    className="cb-delete-btn" 
                                    onClick={() => onDelete(item.enrollmentId)}
                                    title="Remove this course"
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
                    <span className="cb-summary-label">Total Price (chưa thanh toán)</span>
                    <span className="cb-summary-price">{totalPrice.toLocaleString('vi-VN')} VND</span>
                    {hasUnpaid ? (
                        <>
                            <button className="cb-register-btn" onClick={onGoTuition}>Payment Now</button>
                            <p className="cb-summary-note">
                                You will be redirected to the tuition page to complete your payment.
                            </p>
                        </>
                    ) : (
                        <p className="cb-summary-note">
                            All courses have been paid.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
