
import { quickActionsData } from "../../../../data/StudentData/OtherData"; 
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
    return (
        <section className="quick-action-card">
            <h2 className="qa-header-title">Quick Actions</h2>

            <div className="qa-list">
                {quickActionsData.map((action) => (
                    <button key={action.id} className="qa-item-btn">
                        <div className="qa-icon-wrapper">
                            {renderIcon(action.iconType)}
                        </div>
                        <span className="qa-label">{action.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}