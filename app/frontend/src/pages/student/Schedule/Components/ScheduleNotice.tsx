import React, { useMemo } from 'react';
import { 
    mockNotifications, 
    mockClasses, 
    mockCourses 
} from "../../../../data/StudentData/MainData";
import type { 
    AppNotification, 
    ClassItem, 
    Course 
} from "../../../../types/StudentTypes/MainTypes";
import './ScheduleNotice.css';

export default function ScheduleNoticeFE() {
    // Truy vấn trực tiếp thông báo hủy ca học gần nhất từ bảng Notifications và JOIN với Classes & Courses
    const notice = useMemo(() => {
        const cancelNotif = mockNotifications.find(
            (n: AppNotification) => n.type === 'Cancellation'
        );

        if (!cancelNotif) return null;

        let courseTitle = cancelNotif.title;
        if (cancelNotif.classId) {
            const cls = mockClasses.find((c: ClassItem) => c.id === cancelNotif.classId);
            if (cls) {
                const course = mockCourses.find((co: Course) => co.id === cls.courseId);
                courseTitle = course ? course.name : cls.name;
            }
        }

        return {
            courseTitle,
            cancelledDate: cancelNotif.noticeDate || "Today",
            reason: cancelNotif.message,
            timestamp: cancelNotif.createdAt || ""
        };
    }, []);

    if (!notice) return null;

    return (
        <div className="schedule-notice-container">
            <div className="notice-header">
                <div className="notice-title-group">
                    <div className="notice-icon-box">
                        <i className="fa-solid fa-bullhorn"></i>
                    </div>
                    <div>
                        <h3 className="notice-main-title">Class Cancellations & Notices</h3>
                        <p className="notice-sub-title">Important updates about your classes today.</p>
                    </div>
                </div>
            </div>

            <div className="cancellation-card">
                <div className="cancellation-content">
                    <span className="warning-badge-icon">
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </span>
                    <p className="cancellation-text">
                        <strong>{notice.courseTitle}</strong> on <span>{notice.cancelledDate}</span> is cancelled: {notice.reason}.
                    </p>
                </div>
                <span className="cancellation-time">{notice.timestamp}</span>
            </div>
        </div>
    );
}