import { useState, type FormEvent } from 'react';
import {
    useStudentFeedbackClasses,
    useStudentFeedbackList,
    useStudentApi,
    type StudentFeedbackClass
} from "../../../../services/student/useStudentApi";
import './StudentCoursesFeedback.css';

const StudentCoursesFeedback = () => {
    // 1. Danh sách lớp đang học (từ BE) + lớp đang mở modal
    const { data: enrolledClasses } = useStudentFeedbackClasses();
    const [selectedItem, setSelectedItem] = useState<StudentFeedbackClass | null>(null);

    // 2. Phản hồi của lớp đang chọn + form
    const { data: feedbacks, reload: reloadFeedbacks } = useStudentFeedbackList(selectedItem?.classId ?? null);
    const [feedbackText, setFeedbackText] = useState("");
    const api = useStudentApi();

    const handleSendFeedback = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !feedbackText.trim()) return;

        try {
            await api.send("POST", "feedback", { classId: selectedItem.classId, content: feedbackText.trim() });
            setFeedbackText("");
            reloadFeedbacks();
            alert("Gửi phản hồi thành công!");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gửi phản hồi thất bại.");
        }
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
                    {enrolledClasses.map((item) => {
                        return (
                            <div
                                key={item.classId}
                                className="course-card"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="card-top">
                                    <span className="badge-level">Band {item.bandFrom} - {item.bandTo}</span>
                                    <span className="sessions-count">{item.totalSessions} Sessions</span>
                                </div>
                                <h4 className="course-name">{item.courseName}</h4>
                                <p className="course-desc">{item.description}</p>
                                <div className="card-footer">
                                    <span className="tuition-price">{formatCurrency(item.tuition)}</span>
                                    <span className="view-detail-link">View Details →</span>
                                </div>
                            </div>
                        );
                    })}
                    {enrolledClasses.length === 0 && (
                        <p className="no-courses">Bạn chưa đăng ký khóa học nào.</p>
                    )}
                </div>
            </div>

            {/* CỬA SỔ NỔI (MODAL) HIỂN THỊ CHI TIẾT, TÊN GIÁO VIÊN & FEEDBACK */}
            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedItem.courseName}</h2>
                            <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            {/* Cột thông tin chi tiết */}
                            <div className="modal-column">
                                <h3>Course Information</h3>
                                <ul className="info-list">
                                    <li><strong>Class Name:</strong> <span className="text-blue">{selectedItem.className}</span></li>
                                    <li><strong>Instructor:</strong> <span className="teacher-name">{selectedItem.teacherName}</span></li>
                                    <li><strong>Description:</strong> {selectedItem.description}</li>
                                    <li><strong>Target Band:</strong> {selectedItem.bandFrom} - {selectedItem.bandTo}</li>
                                    <li><strong>Total Sessions:</strong> {selectedItem.totalSessions} sessions</li>
                                    <li><strong>Sessions / Week:</strong> {selectedItem.sessionsPerWeek} sessions/wk</li>
                                    <li><strong>Tuition Fee:</strong> {formatCurrency(selectedItem.tuition)}</li>
                                </ul>
                            </div>

                            {/* Cột feedback */}
                            <div className="modal-column">
                                <h3>Student & Teacher Feedback</h3>

                                <div className="feedback-list">
                                    {feedbacks.length > 0 ? (
                                        feedbacks.map((fb) => (
                                            <div key={fb.id} className="feedback-item">
                                                <p>{fb.content}</p>
                                                <span className="feedback-time">
                                                    {fb.studentName} · {fb.createdAt.slice(0, 10)}
                                                </span>
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