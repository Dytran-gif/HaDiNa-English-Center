import React, { useState } from 'react';
import {
    mockCourses,
    mockEnrollments,
    mockClasses,
    mockTeachers
} from "../../../../data/StudentData/MainData";
import type { Course, ClassItem, Teacher, Enrollment } from "../../../../types/StudentTypes/MainTypes";
import './StudentCoursesFeedback.css';

const StudentCoursesFeedback: React.FC = () => {
    // Giả lập ID học viên đang đăng nhập (hoặc bạn có thể lấy từ context/auth thực tế)
    const currentStudentId = "std-01";

    // 1. Lọc danh sách các khóa học mà học viên đã đăng ký thông qua Enrollment -> ClassItem -> Course & Teacher
    const enrolledCoursesData = mockEnrollments
        .filter((enr: Enrollment) => enr.studentId === currentStudentId)
        .map((enr: Enrollment) => {
            const classItem = mockClasses.find((c: ClassItem) => c.id === enr.classId);
            const course = classItem ? mockCourses.find((co: Course) => co.id === classItem.courseId) : null;
            const teacher = classItem?.teacherId ? mockTeachers.find((t: Teacher) => t.id === classItem.teacherId) : null;

            return {
                enrollment: enr,
                classItem,
                course,
                teacherName: teacher ? teacher.fullName : "Chưa phân công"
            };
        })
        .filter((item): item is { enrollment: Enrollment; classItem: ClassItem; course: Course; teacherName: string } =>
            item.course !== null && item.classItem !== null
        );

    // State quản lý cửa sổ nổi (Modal) khi click vào khóa học
    const [selectedItem, setSelectedItem] = useState<{
        course: Course;
        classItem: ClassItem;
        teacherName: string;
    } | null>(null);

    // State quản lý nội dung feedback theo courseId
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbacks, setFeedbacks] = useState<{ [key: string]: string[] }>({
        "c1": ["Giáo viên giảng dạy rất nhiệt tình, dễ hiểu."],
        "c2": ["Khóa học thực chiến giúp tôi tự tin giao tiếp hơn."]
    });

    const handleSendFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !feedbackText.trim()) return;

        const courseId = selectedItem.course.id;
        setFeedbacks(prev => ({
            ...prev,
            [courseId]: [...(prev[courseId] || []), feedbackText.trim()]
        }));
        setFeedbackText("");
        alert("Gửi phản hồi thành công!");
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    };

    return (
        <div className="feedback-container">
            {/* Tiêu đề trang */}
            <div className="header-section">
                <div className="icon-box">💬</div>
                <div className="header-text">
                    <h1>My Courses & Feedback</h1>
                    <p>Click on a course to view detailed information and teacher feedback.</p>
                </div>
            </div>

            {/* Danh sách khóa học đã đăng ký của học viên */}
            <div className="courses-grid-section">
                <h3 className="section-heading">Enrolled Courses</h3>
                <div className="courses-grid">
                    {enrolledCoursesData.map((item, index) => {
                        const course = item.course;
                        return (
                            <div
                                key={index}
                                className="course-card"
                                onClick={() => setSelectedItem({
                                    course,
                                    classItem: item.classItem,
                                    teacherName: item.teacherName
                                })}
                            >
                                <div className="card-top">
                                    <span className="badge-level">Band {course.bandFrom} - {course.bandTo}</span>
                                    <span className="sessions-count">{course.totalSessions} Sessions</span>
                                </div>
                                <h4 className="course-name">{course.name}</h4>
                                <p className="course-desc">{course.description}</p>
                                <div className="card-footer">
                                    <span className="tuition-price">{formatCurrency(course.tuition)}</span>
                                    <span className="view-detail-link">View Details →</span>
                                </div>
                            </div>
                        );
                    })}
                    {enrolledCoursesData.length === 0 && (
                        <p className="no-courses">Bạn chưa đăng ký khóa học nào.</p>
                    )}
                </div>
            </div>

            {/* CỬA SỔ NỔI (MODAL) HIỂN THỊ CHI TIẾT, TÊN GIÁO VIÊN & FEEDBACK */}
            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedItem.course.name}</h2>
                            <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            {/* Cột thông tin chi tiết */}
                            <div className="modal-column">
                                <h3>Course Information</h3>
                                <ul className="info-list">
                                    <li><strong>Class Name:</strong> <span className="text-blue">{selectedItem.classItem.name}</span></li>
                                    <li><strong>Instructor:</strong> <span className="teacher-name">{selectedItem.teacherName}</span></li>
                                    <li><strong>Description:</strong> {selectedItem.course.description}</li>
                                    <li><strong>Target Band:</strong> {selectedItem.course.bandFrom} - {selectedItem.course.bandTo}</li>
                                    <li><strong>Total Sessions:</strong> {selectedItem.course.totalSessions} sessions</li>
                                    <li><strong>Sessions / Week:</strong> {selectedItem.course.sessionsPerWeek} sessions/wk</li>
                                    <li><strong>Tuition Fee:</strong> {formatCurrency(selectedItem.course.tuition)}</li>
                                </ul>
                            </div>

                            {/* Cột feedback */}
                            <div className="modal-column">
                                <h3>Student & Teacher Feedback</h3>

                                <div className="feedback-list">
                                    {(feedbacks[selectedItem.course.id] || []).length > 0 ? (
                                        (feedbacks[selectedItem.course.id]).map((fb, idx) => (
                                            <div key={idx} className="feedback-item">
                                                <p>{fb}</p>
                                                <span className="feedback-time">Today</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-feedback">Chưa có phản hồi nào cho khóa học này.</p>
                                    )}
                                </div>

                                <form onSubmit={handleSendFeedback} className="feedback-form">
                                    <textarea
                                        rows={3}
                                        placeholder="Write your feedback or review..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        className="feedback-textarea"
                                    />
                                    <button type="submit" className="btn-submit-feedback">
                                        Submit Feedback
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCoursesFeedback;