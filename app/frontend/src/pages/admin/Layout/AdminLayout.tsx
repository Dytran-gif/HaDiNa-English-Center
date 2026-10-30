import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";

import "./AdminLayout.css";
import "../Components/Api/AdminApi.css";

function AdminLayout() {
    const { token } = useAuth();
    const { pathname } = useLocation();
    const illustrative = ["/admin/dashboard", "/admin/blog", "/admin/reports", "/admin/users"].includes(pathname);
    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-main">
                <Header />
                <main className="admin-content">
                    {!token && <div className="admin-api-notice admin-api-demo">Bạn đang xem chế độ demo. Các trang quản lý dữ liệu thật cần <Link to="/dang-nhap">đăng nhập bằng máy chủ</Link> để tải và lưu.</div>}
                    {illustrative && <p className="admin-api-notice">Trang này hiện dùng dữ liệu minh họa, chưa kết nối với dữ liệu quản lý thật.</p>}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
