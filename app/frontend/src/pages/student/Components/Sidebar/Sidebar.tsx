import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import { sidebarMenuItems } from "../../../../data/StudentData/SidebarData";
import { useAuth } from "../../../../context/AuthContext";
import { useLang } from "../../../../i18n/LanguageContext";

const NAV_KEYS: Record<string, string> = {
    "/student/dashboard": "nav.dashboard",
    "/student/schedule": "nav.schedule",
    "/student/courses": "nav.courses",
    "/student/feedback": "nav.feedback",
    "/student/tuition": "nav.tuition",
    "/student/profile": "nav.profile",
};

interface SidebarProps {
    open?: boolean;      // mobile: drawer đang mở
    onClose?: () => void; // mobile: đóng drawer (bấm nền/khi chọn menu)
}

function Sidebar({ open = false, onClose }: SidebarProps) {
    const { logout } = useAuth();
    const { t } = useLang();
    const [confirmLogout, setConfirmLogout] = useState(false);

    // Xóa phiên rồi về trang chủ công khai. Dùng location.replace để guard của route
    // /student không chen ngang điều hướng SPA (trước đây bị đẩy về /dang-nhap).
    const handleLogout = () => {
        logout();
        window.location.replace("/");
    };

    // Esc để đóng hộp thoại xác nhận
    useEffect(() => {
        if (!confirmLogout) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setConfirmLogout(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [confirmLogout]);

    return (
        <>
        <aside className={`student-sidebar ${open ? "open" : ""}`}>

            {/* Nút đóng drawer (chỉ hiện trên mobile) */}
            <button
                type="button"
                className="sidebar-close-btn"
                onClick={onClose}
                aria-label="Close menu"
            >
                ×
            </button>

            {/* =========================
                LOGO
            ========================= */}
            <div className="sidebar-logo">
                <h1>Hadi</h1>
                <p>Learn English Grow Everyday</p>
            </div>


            {/* =========================
                SIDEBAR SCROLL AREA
            ========================= */}
            <div className="sidebar-scroll">

                {/* =========================
                    MENU CHÍNH
                ========================= */}
                <nav className="sidebar-menu">

                    {sidebarMenuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-item active"
                                    : "sidebar-item"
                            }
                        >
                            <span className="sidebar-icon">
                                <i className={item.icon}></i>
                            </span>

                            <span>{t(NAV_KEYS[item.path] ?? item.label)}</span>
                        </NavLink>
                    ))}

                </nav>


                {/* =========================
                    MENU TÀI KHOẢN
                ========================= */}
                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className="sidebar-item logout-button"
                        onClick={() => setConfirmLogout(true)}
                    >
                        <span className="sidebar-icon"><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
                        <span>{t("nav.logout")}</span>
                    </button>

                </div>

            </div>

        </aside>

        {/* Hộp thoại xác nhận đăng xuất */}
        {confirmLogout && (
            <div className="logout-modal-overlay" onClick={() => setConfirmLogout(false)}>
                <div
                    className="logout-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="logout-modal-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="logout-modal-icon">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </div>
                    <h3 id="logout-modal-title">{t("logout.confirmTitle")}</h3>
                    <p>{t("logout.confirmMsg")}</p>
                    <div className="logout-modal-actions">
                        <button
                            type="button"
                            className="logout-modal-btn ghost"
                            onClick={() => setConfirmLogout(false)}
                            autoFocus
                        >
                            {t("logout.cancel")}
                        </button>
                        <button
                            type="button"
                            className="logout-modal-btn danger"
                            onClick={handleLogout}
                        >
                            {t("nav.logout")}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default Sidebar;