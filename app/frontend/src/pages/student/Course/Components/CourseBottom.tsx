
import type { StudentEnrollmentItem } from '../../../../services/student/useStudentApi';
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import './CourseBottom.css';

interface CourseBottomProps {
    enrolledCourses: StudentEnrollmentItem[]; // Các khóa học viên đã đăng ký (đọc từ DB)
    onDelete: (enrollmentId: number) => void; // Hàm hủy ghi danh (xóa trong DB)
    onGoTuition: () => void; // Hàm điều hướng sang trang học phí
}

export default function CourseBottomFE({ enrolledCourses, onDelete, onGoTuition }: CourseBottomProps) {
    // Nếu chưa đăng ký khóa nào thì ẩn khu vực này
    if (enrolledCourses.length === 0) return null;

    // Tính tổng học phí của tất cả các khóa học đã đăng ký (chuẩn thuộc tính tuition từ DB)
    const totalPrice = enrolledCourses.reduce((sum, item) => sum + item.course.tuition, 0);

    return (
        <section className="course-bottom-section">
            {/* Cột trái: Danh sách các khóa học đã đăng ký */}
            <div className="cb-left-panel">
                <h3 className="cb-panel-title">Registered Courses ({enrolledCourses.length})</h3>
                
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
                                    <h4 className="cb-title">{item.course.name}</h4>
                                    <div className="cb-meta">
                                        <span><i className="fa-regular fa-clock"></i> {item.course.totalSessions} sessions</span>
                                        <span className="cb-price-item">{item.course.tuition.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 3. Nút Xóa khóa học (hủy ghi danh trong DB) */}
                            <button 
                                className="cb-delete-btn" 
                                onClick={() => onDelete(item.enrollmentId)}
                                title="Remove this course"
                            >
                                <i className="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cột phải: Tổng tiền và Nút thanh toán */}
            <div className="cb-right-panel">
                <div className="cb-summary-card">
                    <span className="cb-summary-label">Total Price</span>
                    <span className="cb-summary-price">{totalPrice.toLocaleString('vi-VN')} VND</span>
                    <button className="cb-register-btn" onClick={onGoTuition}>Payment Now</button>
                    <p className="cb-summary-note">
                        You will be redirected to the tuition page to complete your payment.
                    </p>
                </div>
            </div>
        </section>
    );
}
