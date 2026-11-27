import { useState } from 'react';
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import { useLang } from "../../../../i18n/LanguageContext";
import CourseDetailModal from "./CourseDetailModal";
import "./Course.css";
import "../../StudentExtra.css";

interface CourseProps {
    courses?: Course[];
}

// Lớp đang học / sắp học (mỗi lớp một thẻ: một khóa có thể có nhiều lớp). Không còn hiện dữ liệu mẫu khi đang tải.
export default function CourseFE({ courses }: CourseProps) {
    const { t, money } = useLang();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const list = courses ?? [];

    const openCourse = (course: Course) => setSelectedCourse(course);

    return (
        <section className="cf-section">
            <header className="cf-section-header">
                <div className="cf-header-left">
                    <div className="cf-header-icon">
                        <i className="fa-solid fa-book"></i>
                    </div>
                    <div className="cf-header-text">
                        <h2 className="cf-section-title">{t("presentLessons.title")}</h2>
                        <p className="cf-section-subtitle">{t("presentLessons.sub")}</p>
                    </div>
                </div>
                <a href="/student/courses" className="cf-view-all-link">
                    {t("presentLessons.viewAll")} <span>→</span>
                </a>
            </header>

            {list.length > 0 ? (
                <div className="cf-grid">
                    {list.map((course) => (
                        <article
                            key={course.classId ?? course.id}
                            className="cf-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => openCourse(course)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    openCourse(course);
                                }
                            }}
                            aria-label={`${t("present.cta")}: ${course.name}`}
                        >
                            <div className="cf-card-media">
                                <img src={course.imageUrl || defaultCourseImage} alt={course.name} loading="lazy" />
                                <span className="cf-band">Band {course.bandFrom} - {course.bandTo}</span>
                            </div>

                            <div className="cf-card-body">
                                {course.className && (
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        <span className="sx-code">{course.className}</span>
                                        {course.classStatus && (
                                            <span className={`sx-chip is-${course.classStatus.toLowerCase()}`}>{t(`sx.class.${course.classStatus}`)}</span>
                                        )}
                                    </div>
                                )}
                                <h3 className="cf-card-title">{course.name}</h3>
                                <p className="cf-card-desc">{course.teacherName ? `${t("common.teacher")} ${course.teacherName}` : course.description}</p>
                                {course.classTotalSessions ? (
                                    <div>
                                        <span className="sx-muted">{t("sx.progress", { done: course.sessionsDone ?? 0, total: course.classTotalSessions })}</span>
                                        <div className="sx-progress"><i style={{ width: `${Math.min(100, Math.round(100 * (course.sessionsDone ?? 0) / course.classTotalSessions))}%` }} /></div>
                                    </div>
                                ) : (
                                    <div className="cf-card-meta">
                                        <span><i className="fa-regular fa-clock"></i> {t("common.sessions", { n: course.totalSessions })}</span>
                                        <span><i className="fa-solid fa-calendar-days"></i> {t("common.sessionsPerWeek", { n: course.sessionsPerWeek })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="cf-card-footer">
                                <div className="cf-price-box">
                                    <span className="cf-price">{money(course.tuition)}</span>
                                    {course.discountPercent > 0 && (
                                        <span className="cf-chip discount">-{course.discountPercent}%</span>
                                    )}
                                </div>
                                <span className="cf-view-link">
                                    {t("present.cta")} <i className="fa-solid fa-arrow-right"></i>
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="cf-empty">
                    <i className="fa-solid fa-book-open"></i>
                    <p>{t("presentLessons.empty")}</p>
                </div>
            )}

            {selectedCourse && (
                <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
            )}
        </section>
    );
}
