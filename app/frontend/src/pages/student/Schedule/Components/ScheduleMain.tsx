import { useMemo } from 'react';
import type { StudentScheduleSession } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './ScheduleMain.css';

// Lưới 07:30–21:30, mỗi ô 30 phút
const SLOT_MIN = 30;
// Chiều cao mỗi ô 30 phút — đổi thì sửa cả height của .time-slot/.day-col/.line-bg trong CSS
const SLOT_PX = 40;

const fmtMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
    const start = 7 * 60 + 30 + i * SLOT_MIN;
    return {
        start: fmtMin(start),
        end: fmtMin(start + SLOT_MIN),
        onHour: start % 60 === 0, // nhãn đậm hơn ở đầu giờ
        lineStrong: (start + SLOT_MIN) % 60 === 0 // kẻ chân đậm ở ranh giới giờ
    };
});

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ScheduleGridProps {
    weekStart: Date; // Thứ 2 của tuần đang xem
    sessions: StudentScheduleSession[]; // Các buổi học trong tuần (từ BE)
    onPrevWeek: () => void;
    onNextWeek: () => void;
}

export default function ScheduleGrid({ weekStart, sessions, onPrevWeek, onNextWeek }: ScheduleGridProps) {
    const { t, lang } = useLang();

    // Ngày hôm nay (yyyy-mm-dd) để đánh dấu trong agenda mobile
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Danh sách các ngày trong tuần hiện tại
    const daysOfWeek = useMemo(() => {
        return DAY_NAMES.map((name, idx) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + idx);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');

            return {
                key: name,
                label: t(`day.${name.toLowerCase()}`),
                dateStr: `${year}-${month}-${day}`,
                displayDate: `${day}/${month}`
            };
        });
    }, [weekStart, t]);

    const timeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const getCardStyle = (startTime: string, endTime: string) => {
        const startMin = timeToMinutes(startTime) - timeToMinutes('07:30');
        const durationMin = timeToMinutes(endTime) - timeToMinutes(startTime);
        return {
            top: `${(startMin / SLOT_MIN) * SLOT_PX}px`,
            height: `${(durationMin / SLOT_MIN) * SLOT_PX}px`
        };
    };

    return (
        <div className="schedule-clean-container">
            {/* ĐIỀU HƯỚNG TUẦN */}
            <div className="schedule-header-simple">
                <button className="nav-btn" onClick={onPrevWeek}>
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                <span className="week-label">
                    {t("schedule.weekOf", {
                        date: weekStart.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    })}
                </span>

                <button className="nav-btn" onClick={onNextWeek}>
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            {/* LƯỚI THỜI KHÓA BIỂU (desktop) */}
            <div className="schedule-grid-desktop">
            <div className="grid-box">
                <div className="grid-header">
                    <div className="cell-time-head">{t("schedule.time")}</div>
                    {daysOfWeek.map((day) => (
                        <div key={day.key} className={`cell-day-head ${day.dateStr === todayStr ? 'is-today' : ''}`}>
                            <strong>{day.label}</strong>
                            <span>{day.displayDate}</span>
                        </div>
                    ))}
                </div>

                <div className="grid-body">
                    <div className="time-col">
                        {TIME_SLOTS.map(slot => (
                            <div key={slot.start} className={`time-slot ${slot.onHour ? 'on-hour' : ''}`}>
                                {slot.start}
                            </div>
                        ))}
                    </div>

                    <div className="days-col-wrapper">
                        {daysOfWeek.map((day) => {
                            const sessionsToday = sessions.filter(s => s.dateStr === day.dateStr);

                            return (
                                <div key={day.key} className={`day-col ${day.dateStr === todayStr ? 'is-today' : ''}`}>
                                    {TIME_SLOTS.map(slot => <div key={slot.start} className={`line-bg ${slot.lineStrong ? 'strong' : ''}`}></div>)}

                                    {sessionsToday.map((item) => {
                                        return (
                                            <div
                                                key={`${item.classId}-${item.dateStr}-${item.startTime}`}
                                                className={`class-card-styled ${item.isCancelled ? 'is-cancelled' : ''}`}
                                                style={getCardStyle(item.startTime, item.endTime)}
                                            >
                                                <div className="card-content">
                                                    <div className="card-top-row">
                                                        <h4 className="title">{item.courseName}</h4>
                                                        {item.isCancelled ? (
                                                            <span className="cancelled-badge">{t("schedule.cancelled")}</span>
                                                        ) : (
                                                            <span className="lesson-badge">
                                                                {t("schedule.lesson", { n: item.sessionNo, total: item.totalSessions })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="time">
                                                        <i className="fa-regular fa-clock"></i> {item.startTime} - {item.endTime}
                                                    </p>
                                                    {item.isCancelled ? (
                                                        <p className="card-cancel-reason">
                                                            {item.cancelReason || t("schedule.noReason")}
                                                        </p>
                                                    ) : (
                                                        <div className="card-meta">
                                                            <span className="meta-item">
                                                                <i className="fa-solid fa-hashtag"></i> {item.className}
                                                            </span>
                                                            {item.teacherName && (
                                                                <span className="meta-item">
                                                                    <i className="fa-solid fa-chalkboard-user"></i> {item.teacherName}
                                                                </span>
                                                            )}
                                                            {item.roomName && (
                                                                <span className="meta-item">
                                                                    <i className="fa-solid fa-location-dot"></i> {item.roomName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            </div>

            {/* AGENDA DỌC CHO MOBILE: mỗi ngày một nhóm buổi học */}
            <div className="schedule-agenda">
                {daysOfWeek.map((day) => {
                    const sessionsToday = sessions.filter(s => s.dateStr === day.dateStr);
                    const isToday = day.dateStr === todayStr;

                    return (
                        <section key={day.key} className={`agenda-day ${isToday ? 'is-today' : ''}`}>
                            <header className="agenda-day-head">
                                <span className="agenda-day-name">{day.label}</span>
                                <span className="agenda-day-date">{day.displayDate}</span>
                                {isToday && <span className="agenda-today-chip">{t("schedule.today")}</span>}
                            </header>

                            {sessionsToday.length > 0 ? (
                                <div className="agenda-cards">
                                    {sessionsToday.map((item) => (
                                        <article
                                            key={`${item.classId}-${item.dateStr}-${item.startTime}`}
                                            className={`agenda-card ${item.isCancelled ? 'is-cancelled' : ''}`}
                                        >
                                            <div className="agenda-card-top">
                                                <h4 className="agenda-course">{item.courseName}</h4>
                                                {item.isCancelled ? (
                                                    <span className="agenda-badge cancelled">{t("schedule.cancelled")}</span>
                                                ) : (
                                                    <span className="agenda-badge">
                                                        {t("schedule.lesson", { n: item.sessionNo, total: item.totalSessions })}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="agenda-time">
                                                <i className="fa-regular fa-clock"></i> {item.startTime} - {item.endTime}
                                            </p>

                                            <div className="agenda-meta">
                                                <span><i className="fa-solid fa-hashtag"></i> {item.className}</span>
                                                {item.teacherName && (
                                                    <span><i className="fa-solid fa-chalkboard-user"></i> {item.teacherName}</span>
                                                )}
                                                {item.roomName && (
                                                    <span><i className="fa-solid fa-location-dot"></i> {item.roomName}</span>
                                                )}
                                            </div>

                                            {item.isCancelled && (
                                                <p className="agenda-cancel-reason">
                                                    {item.cancelReason || t("schedule.noReason")}
                                                </p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="agenda-empty">{t("schedule.freeDay")}</p>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}