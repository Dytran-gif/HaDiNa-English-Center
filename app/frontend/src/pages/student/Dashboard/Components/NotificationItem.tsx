import React from 'react';
import { mockNotifications } from "../../../../data/StudentData/MainData";
import type { AppNotification } from "../../../../types/StudentTypes/MainTypes";
import "./NotificationItem.css";

// Hàm hỗ trợ render icon và màu sắc tương ứng theo thuộc tính type trong DB
const renderNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
        case 'Cancellation':
            return (
                <div className="notif-icon-wrapper bg-red-light text-red">
                    <i className="fa-solid fa-circle-exclamation"></i>
                </div>
            );
        case 'ScheduleChange':
            return (
                <div className="notif-icon-wrapper bg-orange-light text-orange">
                    <i className="fa-regular fa-calendar-alt"></i>
                </div>
            );
        case 'General':
        default:
            return (
                <div className="notif-icon-wrapper bg-blue-light text-blue">
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
                {mockNotifications.map((notif: AppNotification) => (
                    <div key={notif.id} className="notif-item">
                        {renderNotificationIcon(notif.type)}
                        
                        <div className="notif-content">
                            <h3 className="notif-item-title">{notif.title}</h3>
                            <p className="notif-item-desc">{notif.message}</p>
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