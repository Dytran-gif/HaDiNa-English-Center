import { useLocation, useNavigate } from "react-router-dom";
import { adminPageTitles } from "../../../../data/AdminData/pageTitles";
import { useAuth } from "../../../../context/AuthContext";
import Button, { IconButton } from "../Ui/Button";
import "./Header.css";
export default function Header({ menuOpen, onOpenMenu }: { menuOpen: boolean; onOpenMenu: () => void }) {
  const { pathname } = useLocation(); const { user, logout } = useAuth();
  const navigate = useNavigate();
  const page = adminPageTitles[pathname] ?? adminPageTitles[pathname.replace(/\/\d+$/, "")] ?? { title: "Quản trị", subtitle: "Quản lý hoạt động trung tâm." };
  const name = user?.full_name || user?.email || "Quản trị viên";
  return <><header className="admin-header"><div className="admin-header-heading"><IconButton className="admin-menu-toggle" icon="menu" label="Mở menu quản trị" aria-expanded={menuOpen} aria-haspopup="dialog" onClick={onOpenMenu}/><div className="admin-header-title"><h1>{page.title}</h1><p>{page.subtitle}</p></div></div>
    <div className="admin-header-account">
      <Button className="admin-profile-trigger" variant="ghost" aria-label={`Xem thông tin tài khoản ${name}`} onClick={() => navigate("/admin/profile")}>
        <span className="admin-user-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
        <span className="admin-user-info"><strong title={name}>{name}</strong><span title={user?.email}>{user?.email ?? ""}</span></span>
      </Button>
      <Button className="admin-header-logout" variant="ghost" icon="logout" onClick={logout}>Đăng xuất</Button>
    </div>
  </header>

  </>;
}
