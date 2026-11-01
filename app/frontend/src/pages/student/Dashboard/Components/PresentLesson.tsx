import { mockCourses } from "../../../../data/StudentData/MainData";
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
    const defaultCourse = mockCourses[0];
    const displayCourse = lesson ? {
        name: lesson.courseName,
        bandFrom: lesson.bandFrom,
        bandTo: lesson.bandTo,
        description: lesson.description || `${lesson.totalSessions ?? 0} Sessions`,
        imageUrl: lesson.imageUrl
    } : defaultCourse ? {
        name: defaultCourse.name,
        bandFrom: defaultCourse.bandFrom,
        bandTo: defaultCourse.bandTo,
        description: defaultCourse.description || `${defaultCourse.totalSessions} Sessions`,
        imageUrl: defaultCourse.imageUrl
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
