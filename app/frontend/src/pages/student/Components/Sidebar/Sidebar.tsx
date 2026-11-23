import { NavLink, useNavigate } from "react-router-dom";
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
};

function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useLang();

    // Xóa phiên rồi về trang chủ công khai (replace để nút Back không quay lại trang student)
    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    return (
        <aside className="student-sidebar">

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
                        onClick={handleLogout}
                    >
                        <span className="sidebar-icon"><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
                        <span>{t("nav.logout")}</span>
                    </button>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;