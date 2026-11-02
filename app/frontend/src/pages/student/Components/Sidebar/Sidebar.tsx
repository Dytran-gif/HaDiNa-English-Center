import { NavLink, Link } from "react-router-dom";
import "./Sidebar.css";

import { sidebarMenuItems } from "../../../../data/StudentData/SidebarData";

function Sidebar() {
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

                            <span>{item.label}</span>
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
                    >
                        <span className="sidebar-icon"><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
                        <span>Log out</span>
                    </button>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;