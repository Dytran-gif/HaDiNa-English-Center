import type { StudentScheduleNotice } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import './ScheduleNotice.css';

interface ScheduleNoticeProps {
    notices: StudentScheduleNotice[]; // Thông báo lịch học (từ BE; DB chưa có bảng nên thường rỗng)
}

export default function ScheduleNoticeFE({ notices }: ScheduleNoticeProps) {
    const { t } = useLang();

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
                        <h3 className="notice-main-title">{t("notice.title")}</h3>
                        <p className="notice-sub-title">{t("notice.sub")}</p>
                    </div>
                </div>
            </div>

            <div className="cancellation-card">
                <div className="cancellation-content">
                    <span className="warning-badge-icon">
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </span>
                    <p className="cancellation-text">
                        {t("notice.line", { title: notice.title, date: notice.dateStr, message: notice.message })}
                    </p>
                </div>
            </div>
        </div>
    );
}