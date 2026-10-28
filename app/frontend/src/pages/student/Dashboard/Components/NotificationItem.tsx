
import { recentNotificationsData } from "../../../../data/StudentData/MainData"; // Đảm bảo đường dẫn data
import "./NotificationItem.css";

// Hàm hỗ trợ render icon và màu sắc tương ứng
const renderNotificationIcon = (iconType: string) => {
    switch (iconType) {
        case 'feedback':
            return (
                <div className="notif-icon-wrapper bg-red-light text-red">
                    <i className="fa-regular fa-comment-dots"></i>
                </div>
            );
        case 'payment':
            return (
                <div className="notif-icon-wrapper bg-red-light text-red">
                    <i className="fa-solid fa-credit-card"></i>
                </div>
            );
        case 'lesson':
            return (
                <div className="notif-icon-wrapper bg-blue-light text-blue">
                    <i className="fa-solid fa-book-open-reader"></i>
                </div>
            );
        case 'schedule':
            return (
                <div className="notif-icon-wrapper bg-orange-light text-orange">
                    <i className="fa-regular fa-calendar-alt"></i>
                </div>
            );
        default:
            return (
                <div className="notif-icon-wrapper bg-gray-light text-gray">
                    <i className="fa-regular fa-bell"></i>
                </div>
            );
    }
};

export default function NotificationItemFE() {
    return (
        <section className="notification-card">
            {/* Header */}
            <header className="notif-header">
                <h2 className="notif-title">Recent Notifications</h2>
                <a href="#notifications" className="notif-view-all">View all</a>
            </header>

            {/* Danh sách thông báo */}
            <div className="notif-list">
                {recentNotificationsData.map((notif) => (
                    <div key={notif.id} className="notif-item">
                        {renderNotificationIcon(notif.iconType)}
                        
                        <div className="notif-content">
                            <h3 className="notif-item-title">{notif.title}</h3>
                            <p className="notif-item-desc">{notif.description}</p>
                        </div>

                        <div className="notif-arrow">
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}