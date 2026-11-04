import type { StudentScheduleNotice } from "../../../../services/student/useStudentApi";
import './ScheduleNotice.css';

interface ScheduleNoticeProps {
    notices: StudentScheduleNotice[]; // Thông báo lịch học (từ BE; DB chưa có bảng nên thường rỗng)
}

export default function ScheduleNoticeFE({ notices }: ScheduleNoticeProps) {
    if (notices.length === 0) return null;

    const notice = notices[0];

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
                        <strong>{notice.title}</strong> on <span>{notice.dateStr}</span>: {notice.message}.
                    </p>
                </div>
            </div>
        </div>
    );
}