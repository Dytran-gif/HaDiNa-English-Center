import { useMemo } from 'react';
import type { StudentScheduleSession } from "../../../../services/student/useStudentApi";
import './ScheduleMain.css';

const TIME_SLOTS = [
    { start: '07:30', end: '08:30' }, { start: '08:30', end: '09:30' },
    { start: '09:30', end: '10:30' }, { start: '10:30', end: '11:30' },
    { start: '11:30', end: '12:30' }, { start: '12:30', end: '13:30' },
    { start: '13:30', end: '14:30' }, { start: '14:30', end: '15:30' },
    { start: '15:30', end: '16:30' }, { start: '16:30', end: '17:30' },
    { start: '17:30', end: '18:30' }, { start: '18:30', end: '19:30' },
    { start: '19:30', end: '20:30' }
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ScheduleGridProps {
    weekStart: Date; // Thứ 2 của tuần đang xem
    sessions: StudentScheduleSession[]; // Các buổi học trong tuần (từ BE)
    onPrevWeek: () => void;
    onNextWeek: () => void;
}

export default function ScheduleGrid({ weekStart, sessions, onPrevWeek, onNextWeek }: ScheduleGridProps) {
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
                label: name,
                dateStr: `${year}-${month}-${day}`,
                displayDate: `${day}/${month}`
            };
        });
    }, [weekStart]);

    const timeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const getCardStyle = (startTime: string, endTime: string) => {
        const startMin = timeToMinutes(startTime) - timeToMinutes('07:30');
        const durationMin = timeToMinutes(endTime) - timeToMinutes(startTime);
        return {
            top: `${(startMin / 60) * 54}px`,
            height: `${(durationMin / 60) * 54}px`
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
                    Week of {weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>

                <button className="nav-btn" onClick={onNextWeek}>
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            {/* LƯỚI THỜI KHÓA BIỂU */}
            <div className="grid-box">
                <div className="grid-header">
                    <div className="cell-time-head">Time</div>
                    {daysOfWeek.map((day) => (
                        <div key={day.key} className="cell-day-head">
                            <strong>{day.label}</strong>
                            <span>{day.displayDate}</span>
                        </div>
                    ))}
                </div>

                <div className="grid-body">
                    <div className="time-col">
                        {TIME_SLOTS.map(slot => (
                            <div key={slot.start} className="time-slot">
                                {slot.start} - {slot.end}
                            </div>
                        ))}
                    </div>

                    <div className="days-col-wrapper">
                        {daysOfWeek.map((day) => {
                            const sessionsToday = sessions.filter(s => s.dateStr === day.dateStr);

                            return (
                                <div key={day.key} className="day-col">
                                    {TIME_SLOTS.map(slot => <div key={slot.start} className="line-bg"></div>)}

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
                                                            <span className="cancelled-badge">Cancelled</span>
                                                        ) : (
                                                            <span className="lesson-badge">
                                                                Lesson {item.sessionNo}/{item.totalSessions}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="time">
                                                        <i className="fa-regular fa-clock"></i> {item.startTime} - {item.endTime}
                                                    </p>
                                                </div>

                                                {/* HOVER POPUP CHI TIẾT */}
                                                <div className="card-hover-popup">
                                                    <div className="popup-top">
                                                        <span className={`popup-level ${item.isCancelled ? 'popup-cancelled-tag' : ''}`}>
                                                            {item.isCancelled ? 'Cancelled' : `Band ${item.bandFrom} - ${item.bandTo}`}
                                                        </span>
                                                        <span className="popup-index">
                                                            Session {item.sessionNo} of {item.totalSessions}
                                                        </span>
                                                    </div>

                                                    <h5 className="popup-course-title">{item.courseName}</h5>

                                                    {item.isCancelled ? (
                                                        <p className="popup-cancel-reason">
                                                            <i className="fa-solid fa-circle-exclamation"></i> Notice: Class cancelled ({item.cancelReason || "No reason provided"})
                                                        </p>
                                                    ) : (
                                                        <p className="popup-desc">{item.description}</p>
                                                    )}

                                                    <div className="popup-info-grid">
                                                        <div>
                                                            <i className="fa-solid fa-hashtag"></i> Class: <strong>{item.className}</strong>
                                                        </div>
                                                        <div>
                                                            <i className="fa-regular fa-clock"></i> {item.startTime} - {item.endTime}
                                                        </div>
                                                        {item.teacherName && (
                                                            <div>
                                                                <i className="fa-solid fa-chalkboard-user"></i> Teacher: <strong>{item.teacherName}</strong>
                                                            </div>
                                                        )}
                                                        {item.roomName && (
                                                            <div>
                                                                <i className="fa-solid fa-location-dot"></i> Room: <strong>{item.roomName}</strong>
                                                            </div>
                                                        )}
                                                    </div>
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
    );
}