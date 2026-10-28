import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import { adminSidebarMenuItems } from "../../../../data/AdminData/sidebarMenuItems";
import { useAuth } from "../../../../context/AuthContext";

function Sidebar() {
    const { logout } = useAuth();

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <h1>Hadi</h1>
                <p>Admin Panel</p>
            </div>

            <nav className="sidebar-menu">
                {adminSidebarMenuItems.map((item) => (
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
