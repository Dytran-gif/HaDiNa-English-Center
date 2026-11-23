import { useState } from 'react';
import {
    useStudentFeedbackClasses,
    useStudentFeedbackList,
    type StudentFeedbackClass
} from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './StudentCoursesFeedback.css';

const StudentCoursesFeedback = () => {
    const { t, money } = useLang();

    // 1. Danh sách lớp đang học (từ BE) + lớp đang mở modal
    const { data: enrolledClasses } = useStudentFeedbackClasses();
    const [selectedItem, setSelectedItem] = useState<StudentFeedbackClass | null>(null);

    // 2. Nhận xét giáo viên viết cho chính mình ở lớp đang chọn
    const { data: feedbacks } = useStudentFeedbackList(selectedItem?.classId ?? null);

    return (
        <div className="Feedback-container">
            {/* Unified Card: Tiêu đề trang + Danh sách khóa học */}
            <div className="Feedback-main-card">
                <div className="Feedback-header-section">
                    <div className="Feedback-icon-box">💬</div>
                    <div className="Feedback-header-text">
                        <h1>{t("feedback.title")}</h1>
                        <p>{t("feedback.sub")}</p>
                    </div>
                </div>

                {/* Danh sách khóa học đã đăng ký của học viên */}
                <div className="Feedback-courses-grid-section">
                    <h3 className="Feedback-section-heading">{t("feedback.section")}</h3>
                    <div className="Feedback-courses-grid">
                        {enrolledClasses.map((item) => {
                            return (
                                <div
                                    key={item.classId}
                                    className="Feedback-course-card"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="Feedback-card-top">
                                        <span className="Feedback-badge-level">Band {item.bandFrom} - {item.bandTo}</span>
                                        <span className="Feedback-sessions-count">{t("common.sessions", { n: item.totalSessions })}</span>
                                    </div>
                                    <h4 className="Feedback-course-name">{item.courseName}</h4>
                                    <p className="Feedback-course-desc">{item.description}</p>
                                    <div className="Feedback-card-footer">
                                        <span className="Feedback-tuition-price">{money(item.tuition)}</span>
                                        <span className="Feedback-view-detail-link">{t("feedback.view")}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {enrolledClasses.length === 0 && (
                            <p className="Feedback-no-courses">{t("feedback.noCourses")}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* CỬA SỔ NỔI (MODAL) HIỂN THỊ CHI TIẾT, TÊN GIÁO VIÊN & FEEDBACK */}
            {selectedItem && (
                <div className="Feedback-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="Feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="Feedback-modal-header">
                            <h2>{selectedItem.courseName}</h2>
                            <button className="Feedback-close-btn" onClick={() => setSelectedItem(null)}>×</button>
                        </div>

                        <div className="Feedback-modal-body">
                            {/* Cột thông tin chi tiết */}
                            <div className="Feedback-modal-column">
                                <h3>{t("feedback.info")}</h3>
                                <ul className="Feedback-info-list">
                                    <li><strong>{t("feedback.className")}:</strong> <span className="Feedback-text-blue">{selectedItem.className}</span></li>
                                    <li><strong>{t("feedback.instructor")}:</strong> <span className="Feedback-teacher-name">{selectedItem.teacherName}</span></li>
                                    <li><strong>{t("feedback.description")}:</strong> {selectedItem.description}</li>
                                    <li><strong>{t("feedback.targetBand")}:</strong> {selectedItem.bandFrom} - {selectedItem.bandTo}</li>
                                    <li><strong>{t("feedback.totalSessions")}:</strong> {t("common.sessions", { n: selectedItem.totalSessions })}</li>
                                    <li><strong>{t("feedback.perWeek")}:</strong> {t("common.sessionsPerWeek", { n: selectedItem.sessionsPerWeek })}</li>
                                    <li><strong>{t("feedback.tuition")}:</strong> {money(selectedItem.tuition)}</li>
                                </ul>
                            </div>

                            {/* Cột nhận xét của giáo viên */}
                            <div className="Feedback-modal-column">
                                <h3>{t("feedback.teacherFeedback")}</h3>

                                <div className="Feedback-feedback-list">
                                    {feedbacks.length > 0 ? (
                                        feedbacks.map((fb) => (
                                            <div key={fb.id} className="Feedback-feedback-item">
                                                <p>{fb.content}</p>
                                                <span className="Feedback-feedback-time">
                                                    {fb.teacherName} · {fb.createdAt.slice(0, 10)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="Feedback-no-feedback">{t("feedback.none")}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCoursesFeedback;