import { useAuth } from "../../../context/AuthContext";
import SectionCard from "../Components/Ui/SectionCard";
import Badge from "../Components/Ui/Badge";
import PasswordCard from "./PasswordCard";
import "./Profile.css";

export default function Profile() {
  const { user } = useAuth();
  const name = user?.full_name && user.full_name !== user.email ? user.full_name : "Quản trị viên";
  return <div className="admin-settings-panels admin-personal-profile">
    <SectionCard title="Thông tin cá nhân">
      <div className="admin-personal-identity">
        <span className="admin-personal-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
        <div><h2>{name}</h2><Badge tone="info">Quản trị viên</Badge></div>
      </div>
      <dl className="admin-profile-details">
        <div><dt>Họ và tên</dt><dd>{name === "Quản trị viên" ? "Chưa cập nhật" : name}</dd></div>
        <div><dt>Email đăng nhập</dt><dd>{user?.email || "Chưa cập nhật"}</dd></div>
        <div><dt>Số điện thoại</dt><dd>{user?.phone || "Chưa cập nhật"}</dd></div>
        <div><dt>Vai trò</dt><dd>Quản trị viên (Admin)</dd></div>
      </dl>
      <p className="admin-personal-hint">Thông tin hiển thị từ tài khoản đang đăng nhập.</p>
    </SectionCard>
    <PasswordCard/>
  </div>;
}
