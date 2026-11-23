import bannerImage from "../../../../assets/images/Banner-dashboard.png";
import bannerArrowImage from "../../../../assets/images/Banner-arrow-dashboard.png";
import defaultCourseImage from "../../../../assets/images/next-lesson-mock.jpg";
import { useLang } from "../../../../i18n/LanguageContext";
import "./PresentLesson.css";

interface PresentLessonProps {
    lesson?: {
        courseName: string;
        bandFrom: number | string;
        bandTo: number | string;
        description?: string;
        totalSessions?: number;
        imageUrl?: string;
        nextDate?: string;   // "YYYY-MM-DD"
        startTime?: string;  // "HH:mm:ss"
        endTime?: string;
    };
    onOpen?: () => void; // bấm vào card -> mở popup chi tiết khóa (giống Present Lessons)
}

export default function PresentLessonFE({ lesson, onOpen }: PresentLessonProps) {
    const { t } = useLang();

    // Chỉ hiển thị khi có dữ liệu thật từ BE (không còn fallback dữ liệu mẫu)
    if (!lesson) return null;

    const timeLabel = lesson.startTime && lesson.endTime
        ? `${lesson.startTime.slice(0, 5)} - ${lesson.endTime.slice(0, 5)}`
        : null;

    const dateLabel = lesson.nextDate
        ? lesson.nextDate.split("-").reverse().join("/")
        : null;

    return (
        <section className="next-lesson-section">
            <div className="bg-gradient-overlay"></div>

            <div className="left-column">
                <span className="badge">
                    {t("present.badge")}
                </span> 

                <h2 className="title">
                    {t("present.title")}
                </h2>

                <p className="description">
                    {t("present.desc")}
                </p>
            </div>

            <div
                className={`middle-column card ${onOpen ? 'card-clickable' : ''}`}
                onClick={onOpen}
                onKeyDown={(e) => {
                    if (!onOpen) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpen();
                    }
                }}
                role={onOpen ? 'button' : undefined}
                tabIndex={onOpen ? 0 : undefined}
                aria-label={onOpen ? `${t("present.cta")}: ${lesson.courseName}` : undefined}
            >
                <img
                    src={lesson.imageUrl || defaultCourseImage}
                    alt={lesson.courseName}
                    className="card-image"
                />
                <h3 className="card-title">
                    Band {lesson.bandFrom} - {lesson.bandTo}: {lesson.courseName}
                </h3>
                <p className="card-subtitle">
                    {lesson.description || t("common.sessions", { n: lesson.totalSessions ?? 0 })}
                </p>
                {(timeLabel || dateLabel) && (
                    <p className="card-schedule">
                        {dateLabel && `${t("present.date")}: ${dateLabel}`}
                        {dateLabel && timeLabel && " · "}
                        {timeLabel && `${t("present.time")}: ${timeLabel}`}
                    </p>
                )}
                {onOpen && (
                    <span className="card-cta">
                        {t("present.cta")} <i className="fa-solid fa-arrow-right"></i>
                    </span>
                )}
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
                    alt={lesson.courseName}
                    className="illustration-image"
                />
            </div>
        </section>
    );
}
