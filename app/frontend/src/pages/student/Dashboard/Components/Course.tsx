import { useRef, useState, useMemo, type MouseEvent } from 'react';
import { mockCourses, mockEnrollments, mockClasses } from "../../../../data/StudentData/MainData";
import type { Course, ClassItem, Enrollment } from "../../../../types/StudentTypes/MainTypes";
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import "./Course.css";

interface CourseProps {
    courses?: Course[];
}

export default function CourseFE({ courses }: CourseProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 0.5;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    // ID học viên đang đăng nhập (khớp với dữ liệu mẫu hệ thống)
    const currentStudentId = "std-01";

    // Có dữ liệu từ API thì dùng dữ liệu API (kể cả rỗng); chưa tải được thì dùng dữ liệu mẫu
    const studentEnrolledCourses = useMemo(() => {
        const list = courses ?? mockEnrollments
            .filter((enr: Enrollment) => enr.studentId === currentStudentId)
            .map((enr: Enrollment) => {
                const classItem = mockClasses.find((c: ClassItem) => c.id === enr.classId);
                const course = classItem ? mockCourses.find((co: Course) => co.id === classItem.courseId) : null;
                return course;
            })
            .filter((course): course is Course => course !== null);

        // Một khóa có thể lặp lại khi học viên học nhiều lớp cùng khóa -> bỏ trùng để key React là duy nhất
        return list.filter((course, i) => list.findIndex(c => c.id === course.id) === i);
    }, [courses, currentStudentId]);

    const list = studentEnrolledCourses;

    return (
        <section className="continue-learning-section">
            <header className="section-header">
                <div className="header-left">
                    <div className="header-icon">
                        <i className="fa-solid fa-book"></i>
                    </div>
                    <div className="header-text">
                        <h2 className="section-title">Present Lessons</h2>
                        <p className="section-subtitle">Pick up where you left off</p>
                    </div>
                </div>
                <a href="/student/courses" className="view-all-link">
                    View all courses <span>→</span>
                </a>
            </header>

            <div
                className={`cards-grid horizontal-scroll-wrapper ${isDragging ? 'active-drag' : ''}`}
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseUpOrLeave}
                onMouseUp={handleMouseUpOrLeave}
                onMouseMove={handleMouseMove}
            >
                {list.map((course) => (
                    <div
                        key={course.id}
                        className="course-card scroll-item"
                        style={{
                            backgroundImage: `url("${course.imageUrl || defaultCourseImage}")`
                        }}
                    >
                        <div className="course-content">
                            <h3 className="course-title">
                                {course.name}
                            </h3>
                            <div className="course-info">
                                <div className="course-meta">
                                    <span className="info-level">Band {course.bandFrom} - {course.bandTo}</span>
                                    <span className="meta-divider">•</span>
                                    <span className="info-time">{course.sessionsPerWeek} sessions/wk</span>
                                </div>

                                <div className="info-skills">
                                    <span className="skill-tag">{course.totalSessions} Sessions</span>
                                    <span className="skill-tag">{course.tuition.toLocaleString('vi-VN')} VND</span>
                                    {course.discountPercent > 0 && (
                                        <span className="skill-tag discount-tag">-{course.discountPercent}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {list.length === 0 && (
                    <div className="no-courses" style={{ padding: '20px', color: '#64748b' }}>
                        Bạn chưa đăng ký khóa học nào.
                    </div>
                )}
            </div>
        </section>
    );
}