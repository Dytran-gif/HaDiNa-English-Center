import React from 'react';
import type { Course } from '../../../../types/StudentTypes/MainTypes';
import './CourseBottom.css';

interface CourseBottomProps {
    selectedCourses: Course[];
    onRemoveCourse: (courseId: string) => void; // Hàm xử lý khi bấm nút xóa ở từng course
}

export default function CourseBottomFE({ selectedCourses, onRemoveCourse }: CourseBottomProps) {
    // Nếu chưa chọn khóa nào thì ẩn khu vực này
    if (selectedCourses.length === 0) return null;

    // Tính tổng học phí của tất cả các khóa học được chọn (chuẩn thuộc tính tuition từ DB)
    const totalPrice = selectedCourses.reduce((sum, course) => sum + course.tuition, 0);

    return (
        <section className="course-bottom-section">
            {/* Cột trái: Danh sách các khóa học đã chọn */}
            <div className="cb-left-panel">
                <h3 className="cb-panel-title">Selected Courses ({selectedCourses.length})</h3>
                
                {/* Danh sách có thanh trượt nếu quá 10 item */}
                <div className="cb-list-wrapper">
                    {selectedCourses.map((course) => (
                        <div key={course.id} className="cb-course-item">
                            
                            {/* 1. Thông tin khóa học */}
                            <div className="cb-course-info">
                                <img 
                                    src={course.imageUrl || "/api/placeholder/400/200"} 
                                    alt={course.name} 
                                    className="cb-img" 
                                />
                                <div className="cb-info-text">
                                    <span className="cb-level badge-beginner">
                                        Band {course.bandFrom} - {course.bandTo}
                                    </span>
                                    <h4 className="cb-title">{course.name}</h4>
                                    <div className="cb-meta">
                                        <span><i className="fa-regular fa-clock"></i> {course.totalSessions} sessions</span>
                                        <span className="cb-price-item">{course.tuition.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 3. Nút Xóa khóa học */}
                            <button 
                                className="cb-delete-btn" 
                                onClick={() => onRemoveCourse(course.id)}
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
                    <button className="cb-register-btn">Register Now</button>
                    <p className="cb-summary-note">
                        You will be redirected to the registration form to complete your enrollment.
                    </p>
                </div>
            </div>
        </section>
    );
}