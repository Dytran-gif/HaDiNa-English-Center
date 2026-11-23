import { useState, useMemo } from 'react';
import { mockCourses, mockEnrollments, mockClasses } from "../../../../data/StudentData/MainData";
import type { Course, ClassItem, Enrollment } from "../../../../types/StudentTypes/MainTypes";
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import { useLang } from "../../../../i18n/LanguageContext";
import CourseDetailModal from "./CourseDetailModal";
import "./Course.css";

interface CourseProps {
    courses?: Course[];
}

export default function CourseFE({ courses }: CourseProps) {
    const { t, money } = useLang();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    // ID học viên đang đăng nhập (khớp với dữ liệu mẫu hệ thống)
    const currentStudentId = "std-01";

    // Có dữ liệu từ API thì dùng dữ liệu API (kể cả rỗng); chưa tải được thì dùng dữ liệu mẫu
    const list = useMemo(() => {
        const source = courses ?? mockEnrollments
            .filter((enr: Enrollment) => enr.studentId === currentStudentId)
            .map((enr: Enrollment) => {
                const classItem = mockClasses.find((c: ClassItem) => c.id === enr.classId);
                return classItem ? mockCourses.find((co: Course) => co.id === classItem.courseId) : null;
            })
            .filter((course): course is Course => course !== null);

        // Một khóa có thể lặp lại khi học viên học nhiều lớp cùng khóa -> bỏ trùng để key React là duy nhất
        return source.filter((course, i) => source.findIndex(c => c.id === course.id) === i);
    }, [courses]);

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
                            key={course.id}
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
                                <h3 className="cf-card-title">{course.name}</h3>
                                <p className="cf-card-desc">{course.description}</p>
                                <div className="cf-card-meta">
                                    <span><i className="fa-regular fa-clock"></i> {t("common.sessions", { n: course.totalSessions })}</span>
                                    <span><i className="fa-solid fa-calendar-days"></i> {t("common.sessionsPerWeek", { n: course.sessionsPerWeek })}</span>
                                </div>
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
