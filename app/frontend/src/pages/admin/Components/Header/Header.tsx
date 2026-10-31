import { useLocation } from "react-router-dom";
import { adminPageTitles } from "../../../../data/AdminData/pageTitles";
import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import Button, { IconButton } from "../Ui/Button";
import Badge from "../Ui/Badge";
import Dialog from "../Ui/Dialog";
import "./Header.css";
export default function Header({ menuOpen, onOpenMenu }: { menuOpen: boolean; onOpenMenu: () => void }) {
  const { pathname } = useLocation(); const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const page = adminPageTitles[pathname] ?? { title: "Quản trị", subtitle: "Quản lý hoạt động trung tâm." };
  const name = user?.full_name || user?.email || "Quản trị viên";
  return <><header className="admin-header"><div className="admin-header-heading"><IconButton className="admin-menu-toggle" icon="menu" label="Mở menu quản trị" aria-expanded={menuOpen} aria-haspopup="dialog" onClick={onOpenMenu}/><div className="admin-header-title"><h1>{page.title}</h1><p>{page.subtitle}</p></div></div>
    <div className="admin-header-account">
      <Button className="admin-profile-trigger" variant="ghost" aria-label={`Xem thông tin tài khoản ${name}`} aria-haspopup="dialog" aria-expanded={profileOpen} onClick={() => setProfileOpen(true)}>
        <span className="admin-user-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
        <span className="admin-user-info"><strong title={name}>{name}</strong><span title={user?.email}>{user?.email ?? ""}</span></span>
      </Button>
      <Button className="admin-header-logout" variant="ghost" icon="logout" onClick={logout}>Đăng xuất</Button>
    </div>
  </header>
    <Dialog open={profileOpen} title="Thông tin quản trị viên" onClose={() => setProfileOpen(false)} footer={<Button onClick={() => setProfileOpen(false)}>Đóng</Button>}>
      <div className="admin-profile-summary"><span className="admin-user-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><div><p className="admin-profile-name">{name}</p><Badge tone="info">Quản trị viên</Badge></div></div>
      <dl className="admin-profile-details">
        <div><dt>Họ và tên</dt><dd>{user?.full_name && user.full_name !== user.email ? user.full_name : "Chưa cập nhật"}</dd></div>
        <div><dt>Email đăng nhập</dt><dd>{user?.email || "Chưa cập nhật"}</dd></div>
        <div><dt>Số điện thoại</dt><dd>{user?.phone || "Chưa cập nhật"}</dd></div>
        <div><dt>Vai trò</dt><dd>Quản trị viên (Admin)</dd></div>
      </dl>
    </Dialog>
  </>;
}
