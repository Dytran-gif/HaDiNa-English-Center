import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import "../../teacher-shared.css";

import { findTeacherPageTitle } from "../../../../data/TeacherData/pageTitles";
import { useAuth } from "../../../../context/AuthContext";
import { assetUrl } from "../../../../services/apiClient";
import { useTeacherApi, useTeacherQuery } from "../../../../services/teacher/teacherApi";
import type { PageTitle } from "../../../../types";
import type { NotificationItem, Paged, TeacherProfile } from "../../../../types/teacherApi";
import { fmtDateTime } from "../Common/format";

function Header() {
    const location = useLocation();
    const { user, token } = useAuth();
    const api = useTeacherApi();
    const { data: profile } = useTeacherQuery<TeacherProfile>(token ? "profile" : null);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const boxRef = useRef<HTMLDivElement>(null);

    const page: PageTitle = findTeacherPageTitle(location.pathname) ?? { title: "Teacher", subtitle: "Trang giáo viên." };

    // Số trên chuông: tải khi đổi trang + 60 giây một lần
    useEffect(() => {
        if (!token) return;
        let alive = true;
        const load = () => api.get<{ unreadCount: number }>("notifications/unread-count")
            .then(r => { if (alive) setUnread(r.unreadCount); }).catch(() => { /* lỗi mạng: giữ số cũ */ });
        void load();
        const timer = setInterval(load, 60_000);
        return () => { alive = false; clearInterval(timer); };
    }, [api, token, location.pathname]);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [open]);

    async function toggle() {
        const next = !open;
        setOpen(next);
        if (next && token) {
            try { setItems((await api.get<Paged<NotificationItem>>("notifications?pageSize=8")).items); } catch { setItems([]); }
        }
    }
    async function markRead(n: NotificationItem) {
        if (n.isRead) return;
        try {
            await api.send("POST", `notifications/${n.id}/read`);
            setItems(list => list.map(x => x.id === n.id ? { ...x, isRead: true } : x));
            setUnread(u => Math.max(0, u - 1));
        } catch { /* bỏ qua */ }
    }

    const name = profile?.fullName ?? user?.full_name ?? "Chưa đăng nhập";
    const avatar = assetUrl(profile?.avatarUrl);

    return (
        <header className="teacher-header">
            <div className="header-title">
                <h1>{page.title}</h1>
                <p>{page.subtitle}</p>
            </div>

            <div className="header-user">
                <div ref={boxRef} style={{ position: "relative" }}>
                    <button type="button" className="t-bell" onClick={toggle} aria-label={`Thông báo, ${unread} chưa đọc`}>
                        🔔{unread > 0 && <span className="t-badge">{unread > 99 ? "99+" : unread}</span>}
                    </button>
                    {open && (
                        <div className="t-dropdown">
                            <div className="t-row t-row--between" style={{ padding: "6px 0" }}>
                                <strong>Thông báo</strong>
                                <Link className="t-link t-small" to="/teacher/requests?tab=notifications" onClick={() => setOpen(false)}>Xem tất cả</Link>
                            </div>
                            {!token ? <p className="t-muted">Đăng nhập bằng tài khoản thật để xem thông báo.</p>
                                : items.length === 0 ? <p className="t-muted">Không có thông báo.</p> : (
                                <ul className="t-list">
                                    {items.map(n => (
                                        <li key={n.id} className={n.isRead ? "" : "unread"} onClick={() => markRead(n)} style={{ cursor: n.isRead ? "default" : "pointer", justifyContent: "flex-start" }}>
                                            <div>
                                                <strong className="t-small">{n.title}</strong>
                                                {n.content && <div className="t-muted t-small">{n.content}</div>}
                                                <div className="t-muted t-small">{fmtDateTime(n.createdAt)}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                <Link to="/teacher/profile" className="user-avatar" style={{ overflow: "hidden", textDecoration: "none" }}>
                    {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name.charAt(0).toUpperCase()}
                </Link>
                <div className="user-info">
                    <strong>{name}</strong>
                    <span>{user?.email}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
