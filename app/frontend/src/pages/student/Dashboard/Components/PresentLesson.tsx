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
            <span className="nl-orb nl-orb-1" aria-hidden="true"></span>
            <span className="nl-orb nl-orb-2" aria-hidden="true"></span>

            <div className="nl-left">
                <span className="nl-badge">
                    <i className="fa-solid fa-bolt"></i> {t("present.badge")}
                </span>

                <h2 className="nl-title">{t("present.title")}</h2>
                <p className="nl-desc">{t("present.desc")}</p>

                {(dateLabel || timeLabel) && (
                    <div className="nl-chips">
                        {dateLabel && (
                            <span className="nl-chip">
                                <i className="fa-regular fa-calendar-days"></i>
                                {t("present.date")}: <strong>{dateLabel}</strong>
                            </span>
                        )}
                        {timeLabel && (
                            <span className="nl-chip">
                                <i className="fa-regular fa-clock"></i>
                                {t("present.time")}: <strong>{timeLabel}</strong>
                            </span>
                        )}
                    </div>
                )}

            </div>

            <div
                className={`nl-course ${onOpen ? 'clickable' : ''}`}
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
                    className="nl-course-img"
                />
                <div className="nl-course-body">
                    <span className="nl-course-band">Band {lesson.bandFrom} - {lesson.bandTo}</span>
                    <h3 className="nl-course-name">{lesson.courseName}</h3>
                    <p className="nl-course-sub">
                        {lesson.description || t("common.sessions", { n: lesson.totalSessions ?? 0 })}
                    </p>
                    {onOpen && (
                        <span className="nl-course-link">
                            {t("present.cta")} <i className="fa-solid fa-arrow-right"></i>
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}
