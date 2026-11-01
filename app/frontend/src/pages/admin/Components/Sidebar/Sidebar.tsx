import { NavLink } from "react-router-dom";
import { adminSidebarMenuGroups } from "../../../../data/AdminData/sidebarMenuItems";
import Icon from "../Ui/Icon";
import "./Sidebar.css";
export default function Sidebar({ drawer = false, onNavigate }: { drawer?: boolean; onNavigate?: () => void }) {
  return <aside className={`admin-sidebar ${drawer ? "admin-sidebar--drawer" : "admin-sidebar--desktop"}`}>
    {!drawer && <div className="admin-sidebar-brand"><span className="admin-brand-mark" aria-hidden="true">H</span><div><strong>Hadi<span>.</span></strong><p>English Center</p></div></div>}
    <nav className="admin-sidebar-menu" aria-label="Điều hướng quản trị">
      {adminSidebarMenuGroups.map(group => <section className="admin-menu-group" key={group.label} aria-label={group.label}><h2>{group.label}</h2>{group.items.map(item => <NavLink key={item.path} to={item.path} onClick={onNavigate} className={({ isActive }) => `admin-sidebar-link${isActive ? " is-active" : ""}`}><Icon name={item.icon}/><span>{item.label}</span></NavLink>)}</section>)}
    </nav>
    <div className="admin-sidebar-footer"><strong>HaDiNa English Center</strong><span>Không gian quản trị</span></div>
  </aside>;
}
