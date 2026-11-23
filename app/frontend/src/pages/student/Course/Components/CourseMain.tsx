import { useState, useMemo } from 'react';
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import './CourseMain.css';

interface CourseMainProps {
    courses: Course[];
    onRegisterCourse: (course: Course) => void;
    registering?: boolean;
}

export default function CourseMainFE({ courses, onRegisterCourse, registering }: CourseMainProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = useMemo(() => {
        return courses.filter((course: Course) => {
            return course.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [courses, searchQuery]);

    return (
        <div className="course-main-card">
            <div className="course-main-section">
                {/* TIÊU ĐỀ */}
                <header className="cm-header">
                    <h1 className="cm-title">Find the Right Course for You</h1>
                    <p className="cm-subtitle">Choose from a variety of English courses designed for your goals and level. Study offline at our center and build your future!</p>
                </header>

                {/* THANH TÌM KIẾM */}
                <div className="cm-filters-container">
                    <div className="cm-filter-row-1">
                        <div className="cm-search-box">
                            <i className="fa-solid fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <span className="cm-result-count">
                            {filteredCourses.length} of {courses.length} courses
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
                                            <span><i className="fa-regular fa-clock"></i> {course.totalSessions} sessions</span>
                                            <span><i className="fa-solid fa-calendar-days"></i> {course.sessionsPerWeek} sessions/wk</span>
                                            {course.teacherName && (
                                                <span><i className="fa-solid fa-chalkboard-user"></i> {course.teacherName}</span>
                                            )}
                                        </div>

                                        {/* Tags Thông tin bổ sung */}
                                        <div className="cm-card-skills">
                                            <span className="cm-skill-tag">{course.totalSessions} Sessions</span>
                                            <span className="cm-skill-tag">Band {course.bandFrom}-{course.bandTo}</span>
                                            {course.discountPercent > 0 && (
                                                <span className="cm-skill-tag discount-tag">-{course.discountPercent}%</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Giá và Nút */}
                                    <div className="cm-card-footer">
                                        <span className="cm-price">
                                            {course.tuition.toLocaleString('vi-VN')} VND
                                        </span>

                                        <div className="cm-card-actions">
                                            <button
                                                className="cm-register-btn"
                                                disabled={registering}
                                                onClick={() => onRegisterCourse(course)}
                                            >
                                                {registering ? 'Registering…' : 'Register'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="cm-no-results">No courses match your criteria. Please adjust your filters.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}