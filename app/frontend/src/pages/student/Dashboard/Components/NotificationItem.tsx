import { useMemo } from 'react';
import { 
    mockNotifications, 
    mockEnrollments, 
    mockClasses 
} from "../../../../data/StudentData/MainData";
import type { 
    AppNotification, 
    Enrollment, 
    ClassItem 
} from "../../../../types/StudentTypes/MainTypes";
import "./NotificationItem.css";

export interface DashboardNotificationItem {
    id: number | string;
    type: string;
    title: string;
    message: string;
}

interface NotificationItemProps {
    notifications?: DashboardNotificationItem[];
}

// Hàm hỗ trợ render icon và màu sắc tương ứng theo thuộc tính type trong DB
const renderNotificationIcon = (type: string) => {
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

export default function NotificationItemFE({ notifications }: NotificationItemProps) {
    // ID học viên đang đăng nhập (đồng bộ với toàn hệ thống)
    const currentStudentId = "usr-06";

    // Tự động lọc các thông báo liên quan đến các lớp học mà học viên đã đăng ký
    const studentNotifications = useMemo(() => {
        if (notifications && notifications.length > 0) return notifications;

        // 1. Lấy danh sách classId mà học viên đã đăng ký (Active)
        const studentClassIds = mockEnrollments
            .filter((enr: Enrollment) => enr.studentId === currentStudentId && enr.status === 'Active')
            .map((enr: Enrollment) => enr.classId);

        // 2. Lọc thông báo chung (General) hoặc thông báo có classId thuộc các lớp học viên đang học
        return mockNotifications.filter((n: AppNotification) => {
            if (n.type === 'General') return true;
            if (n.classId && studentClassIds.includes(n.classId)) return true;
            return false;
        });
    }, [notifications, currentStudentId]);

    const list = studentNotifications;

    return (
        <section className="notification-card">
            <header className="notif-header">
                <h2 className="notif-title">Recent Notifications</h2>
                <a href="#notifications" className="notif-view-all">View all</a>
            </header>

            <div className="notif-list">
                {list.map((notif) => (
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
                {list.length === 0 && (
                    <div className="no-notifications" style={{ padding: '16px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                        Không có thông báo mới nào.
                    </div>
                )}
            </div>
        </section>
    );
}