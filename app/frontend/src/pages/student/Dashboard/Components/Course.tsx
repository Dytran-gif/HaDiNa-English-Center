import { useRef, useState, useMemo, type MouseEvent } from 'react';
import { mockCourses, mockEnrollments, mockClasses } from "../../../../data/StudentData/MainData";
import type { Course, ClassItem, Enrollment } from "../../../../types/StudentTypes/MainTypes";
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import CourseDetailModal from "./CourseDetailModal";
import "./Course.css";

interface CourseProps {
    courses?: Course[];
}

export default function CourseFE({ courses }: CourseProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const didDragRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollRef.current) return;
        didDragRef.current = false;
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
        if (Math.abs(walk) > 3) didDragRef.current = true;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleCardClick = (course: Course) => {
        if (didDragRef.current) {
            didDragRef.current = false;
            return;
        }
        setSelectedCourse(course);
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
        <section className="cf-continue-learning-section">
            <header className="cf-section-header">
                <div className="cf-header-left">
                    <div className="cf-header-icon">
                        <i className="fa-solid fa-book"></i>
                    </div>
                    <div className="cf-header-text">
                        <h2 className="cf-section-title">Present Lessons</h2>
                        <p className="cf-section-subtitle">Pick up where you left off</p>
                    </div>
                </div>
                <a href="/student/courses" className="cf-view-all-link">
                    View all courses <span>→</span>
                </a>
            </header>

            <div
                className={`cf-cards-grid cf-horizontal-scroll-wrapper ${isDragging ? 'cf-active-drag' : ''}`}
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseUpOrLeave}
                onMouseUp={handleMouseUpOrLeave}
                onMouseMove={handleMouseMove}
            >
                {list.map((course) => (
                    <div
                        key={course.id}
                        className="cf-course-card cf-scroll-item"
                        style={{
                            backgroundImage: `url("${course.imageUrl || defaultCourseImage}")`,
                            cursor: 'pointer'
                        }}
                        onClick={() => handleCardClick(course)}
                    >
                        <div className="cf-course-content">
                            <h3 className="cf-course-title">
                                {course.name}
                            </h3>
                            <div className="cf-course-info">
                                <div className="cf-course-meta">
                                    <span className="cf-info-level">Band {course.bandFrom} - {course.bandTo}</span>
                                    <span className="cf-meta-divider">•</span>
                                    <span className="cf-info-time">{course.sessionsPerWeek} sessions/wk</span>
                                </div>

                                <div className="cf-info-skills">
                                    <span className="cf-skill-tag">{course.totalSessions} Sessions</span>
                                    <span className="cf-skill-tag">{course.tuition.toLocaleString('vi-VN')} VND</span>
                                    {course.discountPercent > 0 && (
                                        <span className="cf-skill-tag cf-discount-tag">-{course.discountPercent}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {list.length === 0 && (
                    <div className="cf-no-courses" style={{ padding: '20px', color: '#64748b' }}>
                        Bạn chưa đăng ký khóa học nào.
                    </div>
                )}
            </div>

            {selectedCourse && (
                <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
            )}
        </section>
    );
}