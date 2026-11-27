import { useState, useMemo } from 'react';
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import { useLang } from "../../../../i18n/LanguageContext";
import './CourseMain.css';

interface CourseMainProps {
    courses: Course[];
    onRegisterCourse: (course: Course) => void;
    registering?: boolean;
}

export default function CourseMainFE({ courses, onRegisterCourse, registering }: CourseMainProps) {
    const { t, money } = useLang();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = useMemo(() => {
        return courses.filter((course: Course) => {
            return course.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [courses, searchQuery]);

    // Giá thực trả sau giảm giá (cùng công thức với BE: làm tròn đến 1.000đ)
    const finalPrice = (c: Course) =>
        c.tuition - Math.round(c.tuition * c.discountPercent / 100 / 1000) * 1000;

    return (
        <div className="course-main-card">
            <div className="course-main-section">
                {/* TIÊU ĐỀ */}
                <header className="cm-header">
                    <h1 className="cm-title">{t("browse.title")}</h1>
                    <p className="cm-subtitle">{t("browse.sub")}</p>
                </header>

                {/* THANH TÌM KIẾM */}
                <div className="cm-filters-container">
                    <div className="cm-filter-row-1">
                        <div className="cm-search-box">
                            <i className="fa-solid fa-search"></i>
                            <input
                                type="text"
                                placeholder={t("browse.search")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="cm-search-clear"
                                    onClick={() => setSearchQuery('')}
                                    aria-label={t("browse.clear")}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <span className="cm-result-count">
                            {t("browse.count", { a: filteredCourses.length, b: courses.length })}
                        </span>
                    </div>
                </div>

                {/* DANH SÁCH KHÓA HỌC */}
                <div className="cm-course-list-wrapper">
                    <div className="cm-course-grid">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course: Course) => (
                                <div key={course.id} className="cm-course-card">
                                    {/* Ảnh và Level Badge */}
                                    <div className="cm-card-image">
                                        <img src={course.imageUrl || defaultCourseImage} alt={course.name} />
                                        <span className="cm-badge badge-beginner">
                                            Band {course.bandFrom} - {course.bandTo}
                                        </span>
                                    </div>

                                    {/* Nội dung thẻ */}
                                    <div className="cm-card-content">
                                        <h3 className="cm-card-title">{course.name}</h3>
                                        <p className="cm-card-desc">{course.description}</p>

                                        {/* Thông tin khóa học thực tế từ DB */}
                                        <div className="cm-card-meta">
                                            <span><i className="fa-regular fa-clock"></i> {t("common.sessions", { n: course.totalSessions })}</span>
                                            <span><i className="fa-solid fa-calendar-days"></i> {t("common.sessionsPerWeek", { n: course.sessionsPerWeek })}</span>
                                        </div>

                                        {/* Tags Thông tin bổ sung */}
                                        <div className="cm-card-skills">
                                            <span className="cm-skill-tag">{t("common.sessions", { n: course.totalSessions })}</span>
                                            <span className="cm-skill-tag">Band {course.bandFrom}-{course.bandTo}</span>
                                        </div>
                                    </div>

                                    {/* Giá (sau giảm) và Nút */}
                                    <div className="cm-card-footer">
                                        <div className="cm-price-box">
                                            {course.discountPercent > 0 && (
                                                <span className="cm-price-original">
                                                    {money(course.tuition)}
                                                </span>
                                            )}
                                            <span className="cm-price">
                                                {money(finalPrice(course))}
                                                {course.discountPercent > 0 && (
                                                    <span className="cm-discount-chip">-{course.discountPercent}%</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="cm-card-actions">
                                            <button
                                                className="cm-register-btn"
                                                disabled={registering}
                                                onClick={() => onRegisterCourse(course)}
                                            >
                                                {t("sx.chooseClass")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="cm-no-results">{t("browse.noResults")}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}