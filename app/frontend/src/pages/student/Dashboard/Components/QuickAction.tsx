import { useNavigate } from "react-router-dom";
import { quickActionsData } from "../../../../data/StudentData/OtherData";
import { useLang } from "../../../../i18n/LanguageContext";
import "./QuickAction.css";

// Hàm hỗ trợ render icon dựa vào iconType
const renderIcon = (iconType: string) => {
    switch (iconType) {
        case 'play':
            return <i className="fa-solid fa-play"></i>;
        case 'document':
            return <i className="fa-regular fa-file-lines"></i>;
        case 'calendar':
            return <i className="fa-regular fa-calendar"></i>;
        case 'book':
            return <i className="fa-solid fa-book-open"></i>;
        default:
            return <i className="fa-solid fa-bolt"></i>;
    }
};

export default function QuickActionFE() {
    const navigate = useNavigate();
    const { t } = useLang();

    const handleActionClick = (iconType: string) => {
        if (iconType === "calendar") {
            navigate("/student/schedule");
        } else {
            navigate("/student/courses");
        }
    };

    return (
        <section className="quick-action-card">
            <h2 className="qa-header-title">{t("quick.title")}</h2>

            <div className="qa-list">
                {quickActionsData.map((action) => (
                    <button
                        key={action.id}
                        type="button"
                        className="qa-item-btn"
                        onClick={() => handleActionClick(action.iconType)}
                    >
                        <div className="qa-icon-wrapper">
                            {renderIcon(action.iconType)}
                        </div>
                        <span className="qa-label">
                            {action.iconType === "calendar" ? t("quick.viewSchedule") : t("quick.checkCourses")}
                        </span>
                        <i className="fa-solid fa-chevron-right qa-chevron"></i>
                    </button>
                ))}
            </div>
        </section>
    );
}