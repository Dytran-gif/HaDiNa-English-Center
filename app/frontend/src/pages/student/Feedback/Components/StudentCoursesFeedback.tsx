import { useState } from 'react';
import {
    useStudentFeedbackClasses,
    useStudentFeedbackList,
    type StudentFeedbackClass
} from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './StudentCoursesFeedback.css';

// Chữ cái đầu của tên giáo viên làm avatar
function initials(name: string) {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const StudentCoursesFeedback = () => {
    const { t, money, date } = useLang();

    // 1. Danh sách lớp đang học (từ BE) + lớp đang mở modal
    const { data: enrolledClasses } = useStudentFeedbackClasses();
    const [selectedItem, setSelectedItem] = useState<StudentFeedbackClass | null>(null);

    // 2. Nhận xét giáo viên viết cho chính mình ở lớp đang chọn
    const { data: feedbacks } = useStudentFeedbackList(selectedItem?.classId ?? null);

    return (
        <div className="Feedback-container">
            <div className="Feedback-main-card">
                <div className="Feedback-hero">
                    <div className="Feedback-icon-box">
                        <i className="fa-solid fa-comment-dots"></i>
                    </div>
                    <div className="Feedback-header-text">
                        <h1>{t("feedback.title")}</h1>
                        <p>{t("feedback.sub")}</p>
                    </div>
                </div>

                <div className="Feedback-section-row">
                    <h3 className="Feedback-section-heading">{t("feedback.section")}</h3>
                    {enrolledClasses.length > 0 && (
                        <span className="Feedback-count-chip">{t("count.courses", { n: enrolledClasses.length })}</span>
                    )}
                </div>

                {enrolledClasses.length > 0 ? (
                    <div className="Feedback-courses-grid">
                        {enrolledClasses.map((item) => (
                            <article
                                key={item.classId}
                                className="Feedback-course-card"
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelectedItem(item)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedItem(item);
                                    }
                                }}
                                aria-label={`${t("feedback.view")} ${item.courseName}`}
                            >
                                <div className="Feedback-card-banner">
                                    <span className="Feedback-badge-level">Band {item.bandFrom} - {item.bandTo}</span>
                                    <span className="Feedback-sessions-count">
                                        <i className="fa-regular fa-clock"></i> {t("common.sessions", { n: item.totalSessions })}
                                    </span>
                                </div>

                                <div className="Feedback-card-body">
                                    <h4 className="Feedback-course-name">{item.courseName}</h4>
                                    <p className="Feedback-course-desc">{item.description}</p>
                                    <span className="Feedback-class-chip">
                                        <i className="fa-solid fa-users"></i> {item.className}
                                    </span>
                                </div>

                                <div className="Feedback-card-footer">
                                    <span className="Feedback-tuition-price">{money(item.tuition)}</span>
                                    <span className="Feedback-view-detail-link">{t("feedback.view")}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="Feedback-empty">
                        <i className="fa-solid fa-book-open"></i>
                        <p>{t("feedback.noCourses")}</p>
                    </div>
                )}
            </div>

            {/* MODAL: thông tin khóa + nhận xét giáo viên */}
            {selectedItem && (
                <div className="Feedback-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="Feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="Feedback-modal-header">
                            <div>
                                <h2>{selectedItem.courseName}</h2>
                                <span className="Feedback-modal-sub">Band {selectedItem.bandFrom} - {selectedItem.bandTo}</span>
                            </div>
                            <button className="Feedback-close-btn" onClick={() => setSelectedItem(null)}>×</button>
                        </div>

                        <div className="Feedback-modal-body">
                            <div className="Feedback-modal-column">
                                <h3>{t("feedback.info")}</h3>
                                <ul className="Feedback-info-list">
                                    <li>
                                        <i className="fa-solid fa-users"></i>
                                        <div><span>{t("feedback.className")}</span><strong className="Feedback-text-blue">{selectedItem.className}</strong></div>
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-chalkboard-user"></i>
                                        <div><span>{t("feedback.instructor")}</span><strong>{selectedItem.teacherName}</strong></div>
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-align-left"></i>
                                        <div><span>{t("feedback.description")}</span><p>{selectedItem.description}</p></div>
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-layer-group"></i>
                                        <div><span>{t("feedback.targetBand")}</span><strong>{selectedItem.bandFrom} - {selectedItem.bandTo}</strong></div>
                                    </li>
                                    <li>
                                        <i className="fa-regular fa-clock"></i>
                                        <div><span>{t("feedback.totalSessions")}</span><strong>{t("common.sessions", { n: selectedItem.totalSessions })}</strong></div>
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-calendar-week"></i>
                                        <div><span>{t("feedback.perWeek")}</span><strong>{t("common.sessionsPerWeek", { n: selectedItem.sessionsPerWeek })}</strong></div>
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-money-bill-wave"></i>
                                        <div><span>{t("feedback.tuition")}</span><strong>{money(selectedItem.tuition)}</strong></div>
                                    </li>
                                </ul>
                            </div>

                            <div className="Feedback-modal-column">
                                <h3>{t("feedback.teacherFeedback")}</h3>

                                <div className="Feedback-feedback-list">
                                    {feedbacks.length > 0 ? (
                                        feedbacks.map((fb) => (
                                            <div key={fb.id} className="Feedback-feedback-item">
                                                <span className="Feedback-avatar">{initials(fb.teacherName)}</span>
                                                <div className="Feedback-bubble">
                                                    <div className="Feedback-bubble-head">
                                                        <strong>{fb.teacherName}</strong>
                                                        <span>{date(fb.createdAt)}</span>
                                                    </div>
                                                    <p>{fb.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="Feedback-no-feedback">
                                            <i className="fa-regular fa-comment-dots"></i>
                                            <p>{t("feedback.none")}</p>
                                        </div>
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
