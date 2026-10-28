import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import { teacherSidebarMenuItems } from "../../../../data/TeacherData/sidebarMenuItems";
import { useAuth } from "../../../../context/AuthContext";

function Sidebar() {
    const { logout } = useAuth();

    return (
        <aside className="teacher-sidebar">
            <div className="sidebar-logo">
                <h1>Hadi</h1>
                <p>Teacher Panel</p>
            </div>

            <nav className="sidebar-menu">
                {teacherSidebarMenuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? "sidebar-item active" : "sidebar-item"
                        }
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <button type="button" className="sidebar-item logout-button" onClick={logout}>
                    <span className="sidebar-icon">↪</span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
