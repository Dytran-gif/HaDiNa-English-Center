import React, { useState, useMemo } from 'react';
import { 
    mockEnrollments, 
    mockClasses, 
    mockClassSchedules, 
    mockCourses, 
    mockNotifications 
} from "../../../../data/StudentData/MainData";
import type { 
    Course, 
    ClassItem, 
    ClassScheduleItem, 
    Enrollment, 
    AppNotification 
} from "../../../../types/StudentTypes/MainTypes";
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

// Hàm tính chính xác thứ tự buổi học thực tế dựa trên ngày khai giảng
const getSessionNumber = (startDateStr: string, targetDateStr: string, classSchedules: ClassScheduleItem[]) => {
    const start = new Date(startDateStr);
    const target = new Date(targetDateStr);
    if (target < start) return 0;

    let count = 0;
    const cur = new Date(start);

    while (cur <= target) {
        const jsDay = cur.getDay();
        const dayName = DAY_NAMES[jsDay === 0 ? 6 : jsDay - 1];
        
        const year = cur.getFullYear();
        const month = String(cur.getMonth() + 1).padStart(2, '0');
        const day = String(cur.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const isScheduleDay = classSchedules.some(s => s.dayOfWeek === dayName);
        if (isScheduleDay) {
            count++;
        }

        if (dateStr === targetDateStr) break;
        cur.setDate(cur.getDate() + 1);
    }

    return count;
};

export default function ScheduleGrid() {
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date(2025, 4, 19)); // Thứ 2, 19/05/2025

    // Danh sách các ngày trong tuần hiện tại
    const daysOfWeek = useMemo(() => {
        return DAY_NAMES.map((name, idx) => {
            const d = new Date(currentWeekStart);
            d.setDate(currentWeekStart.getDate() + idx);

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
    }, [currentWeekStart]);

    // TRUY VẤN DỮ LIỆU TRỰC TIẾP TỪ 10 BẢNG DATABASE
    const currentWeekSessions = useMemo(() => {
        const studentId = "std-01"; // Sinh viên đang đăng nhập

        // 1. Lấy các lượt đăng ký Active (Bảng Enrollment)
        const activeEnrollments = mockEnrollments.filter(
            (e: Enrollment) => e.studentId === studentId && e.status === 'Active'
        );

        const sessions: Array<{
            classId: string;
            className: string;
            course: Course;
            classSchedule: ClassScheduleItem;
            dateStr: string;
            sessionIndex: number;
            isCancelled: boolean;
            cancelReason?: string;
        }> = [];

        activeEnrollments.forEach((enrollment) => {
            // 2. Bảng Classes
            const cls = mockClasses.find((c: ClassItem) => c.id === enrollment.classId);
            if (!cls) return;

            // 3. Bảng Courses
            const course = mockCourses.find((co: Course) => co.id === cls.courseId);
            if (!course) return;

            // 4. Bảng ClassSchedule
            const schedules = mockClassSchedules.filter((cs: ClassScheduleItem) => cs.classId === cls.id);

            // 5. Duyệt từng ngày trong tuần
            daysOfWeek.forEach((day) => {
                const dayDate = new Date(day.dateStr);
                const classStartDate = new Date(cls.startDate);

                if (dayDate < classStartDate) return;

                schedules.forEach((sch) => {
                    if (sch.dayOfWeek === day.label) {
                        // Tính số thứ tự buổi học
                        const sessionIndex = getSessionNumber(cls.startDate, day.dateStr, schedules);

                        // ĐÃ HỌC ĐỦ SỐ BUỔI KHÓA HỌC -> CHẶN KHÔNG HIỂN THỊ NỮA
                        if (sessionIndex === 0 || sessionIndex > course.totalSessions) {
                            return;
                        }

                        // 6. Bảng Notifications
                        const cancelNotif = mockNotifications.find(
                            (n: AppNotification) => n.classId === cls.id && n.noticeDate === day.dateStr && n.type === 'Cancellation'
                        );

                        sessions.push({
                            classId: cls.id,
                            className: cls.name,
                            course,
                            classSchedule: sch,
                            dateStr: day.dateStr,
                            sessionIndex,
                            isCancelled: !!cancelNotif,
                            cancelReason: cancelNotif ? cancelNotif.message : undefined
                        });
                    }
                });
            });
        });

        return sessions;
    }, [daysOfWeek]);

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
                <button 
                    className="nav-btn" 
                    onClick={() => {
                        const prev = new Date(currentWeekStart);
                        prev.setDate(prev.getDate() - 7);
                        setCurrentWeekStart(prev);
                    }}
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                <span className="week-label">
                    Week of {currentWeekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>

                <button 
                    className="nav-btn" 
                    onClick={() => {
                        const next = new Date(currentWeekStart);
                        next.setDate(next.getDate() + 7);
                        setCurrentWeekStart(next);
                    }}
                >
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
                            const sessionsToday = currentWeekSessions.filter(s => s.dateStr === day.dateStr);

                            return (
                                <div key={day.key} className="day-col">
                                    {TIME_SLOTS.map(slot => <div key={slot.start} className="line-bg"></div>)}

                                    {sessionsToday.map((item) => {
                                        const { startTime, endTime } = item.classSchedule;

                                        return (
                                            <div
                                                key={`${item.classId}-${item.dateStr}-${startTime}`}
                                                className={`class-card-styled ${item.isCancelled ? 'is-cancelled' : ''}`}
                                                style={getCardStyle(startTime, endTime)}
                                            >
                                                <div className="card-content">
                                                    <div className="card-top-row">
                                                        <h4 className="title">{item.course.name}</h4>
                                                        {item.isCancelled ? (
                                                            <span className="cancelled-badge">Cancelled</span>
                                                        ) : (
                                                            <span className="lesson-badge">
                                                                Lesson {item.sessionIndex}/{item.course.totalSessions}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="time">
                                                        <i className="fa-regular fa-clock"></i> {startTime} - {endTime}
                                                    </p>
                                                </div>

                                                {/* HOVER POPUP CHI TIẾT */}
                                                <div className="card-hover-popup">
                                                    <div className="popup-top">
                                                        <span className={`popup-level ${item.isCancelled ? 'popup-cancelled-tag' : ''}`}>
                                                            {item.isCancelled ? 'Cancelled' : `Band ${item.course.bandFrom} - ${item.course.bandTo}`}
                                                        </span>
                                                        <span className="popup-index">
                                                            Session {item.sessionIndex} of {item.course.totalSessions}
                                                        </span>
                                                    </div>

                                                    <h5 className="popup-course-title">{item.course.name}</h5>

                                                    {item.isCancelled ? (
                                                        <p className="popup-cancel-reason">
                                                            <i className="fa-solid fa-circle-exclamation"></i> Notice: Class cancelled ({item.cancelReason || "No reason provided"})
                                                        </p>
                                                    ) : (
                                                        <p className="popup-desc">{item.course.description}</p>
                                                    )}

                                                    <div className="popup-info-grid">
                                                        <div>
                                                            <i className="fa-solid fa-hashtag"></i> Class: <strong>{item.classId}</strong>
                                                        </div>
                                                        <div>
                                                            <i className="fa-regular fa-clock"></i> {startTime} - {endTime}
                                                        </div>
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