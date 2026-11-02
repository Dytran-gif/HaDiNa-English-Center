import { useMemo } from 'react';
import { mockCourses, mockEnrollments, mockClasses } from "../../../../data/StudentData/MainData";
import type { Course, ClassItem, Enrollment } from "../../../../types/StudentTypes/MainTypes";
import bannerImage from "../../../../assets/images/Banner-dashboard.png";
import bannerArrowImage from "../../../../assets/images/Banner-arrow-dashboard.png";
import "./PresentLesson.css";

interface PresentLessonProps {
    lesson?: {
        courseName: string;
        bandFrom: number | string;
        bandTo: number | string;
        description?: string;
        totalSessions?: number;
        imageUrl?: string;
    };
}

export default function PresentLessonFE({ lesson }: PresentLessonProps) {
    // ID học viên đang đăng nhập (khớp với dữ liệu mẫu hệ thống)
    const currentStudentId = "std-01";

    // Tự động liên kết lấy khóa học đã đăng ký đầu tiên của học viên qua Enrollment -> ClassItem -> Course
    const studentFirstCourse = useMemo(() => {
        const studentEnrollment = mockEnrollments.find((enr: Enrollment) => enr.studentId === currentStudentId);
        if (!studentEnrollment) return null;

        const classItem = mockClasses.find((c: ClassItem) => c.id === studentEnrollment.classId);
        if (!classItem) return null;

        return mockCourses.find((co: Course) => co.id === classItem.courseId) || null;
    }, [currentStudentId]);

    const displayCourse = lesson ? {
        name: lesson.courseName,
        bandFrom: lesson.bandFrom,
        bandTo: lesson.bandTo,
        description: lesson.description || `${lesson.totalSessions ?? 0} Sessions`,
        imageUrl: lesson.imageUrl
    } : studentFirstCourse ? {
        name: studentFirstCourse.name,
        bandFrom: studentFirstCourse.bandFrom,
        bandTo: studentFirstCourse.bandTo,
        description: studentFirstCourse.description || `${studentFirstCourse.totalSessions} Sessions`,
        imageUrl: studentFirstCourse.imageUrl
    } : null;

    if (!displayCourse) return null;

    return (
        <section className="next-lesson-section">
            <div className="bg-gradient-overlay"></div>

            <div className="left-column">
                <span className="badge">
                    Continue Learning
                </span>

                <h2 className="title">
                    Your next lesson is ready!
                </h2>

                <p className="description">
                    Continue where you left off and make progress towards your goals.
                </p>

                <button className="continue-btn" type="button">
                    <svg className="icon-play" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Continue Lesson</span>
                </button>
            </div>

            <div className="middle-column card">
                <img
                    src={displayCourse.imageUrl || "/api/placeholder/400/200"}
                    alt={displayCourse.name}
                    className="card-image"
                />
                <h3 className="card-title">
                    Band {displayCourse.bandFrom} - {displayCourse.bandTo}: {displayCourse.name}
                </h3>
                <p className="card-subtitle">
                    {displayCourse.description}
                </p>
            </div>

            <div className="right-column">
                <div className="decorative-text">
                    Better English <br /> Brighter Future
                </div>
                <img
                    src={bannerArrowImage}
                    className="arrow-image"
                    alt="Arrow styling"
                />
                <img
                    src={bannerImage}
                    alt={displayCourse.name}
                    className="illustration-image"
                />
            </div>
        </section>
    );
}