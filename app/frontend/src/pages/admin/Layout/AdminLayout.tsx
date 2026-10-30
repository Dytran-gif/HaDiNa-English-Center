import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";
import ToastProvider from "../Components/Ui/ToastProvider";
import Dialog from "../Components/Ui/Dialog";

import "./AdminLayout.css";
import "../Components/Api/AdminApi.css";
import "../Components/Ui/AdminTokens.css";
import "../Components/Ui/AdminUi.css";

function AdminLayout() {
    const { token } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 48.001em)");
        const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
        desktop.addEventListener("change", closeOnDesktop);
        return () => desktop.removeEventListener("change", closeOnDesktop);
    }, []);
    const { pathname } = useLocation();
    const illustrative = ["/admin/dashboard", "/admin/blog", "/admin/reports", "/admin/users"].includes(pathname);
    return (
        <div className="admin-layout">
            <ToastProvider>
            <a className="admin-skip-link" href="#admin-main-content">Đến nội dung chính</a>
            <Sidebar />
            <Dialog open={menuOpen} title="Menu quản trị" className="admin-nav-drawer" onClose={() => setMenuOpen(false)}>
                <Sidebar drawer onNavigate={() => setMenuOpen(false)}/>
            </Dialog>
            <div className="admin-main">
                <Header menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)}/>
                <main className="admin-content" id="admin-main-content" tabIndex={-1}>
                    {!token && <div className="admin-api-notice admin-api-demo">Bạn đang xem chế độ demo. Các trang quản lý dữ liệu thật cần <Link to="/dang-nhap">đăng nhập bằng máy chủ</Link> để tải và lưu.</div>}
                    {illustrative && <p className="admin-api-notice">Trang này hiện dùng dữ liệu minh họa, chưa kết nối với dữ liệu quản lý thật.</p>}
                    <Outlet />
                </main>
            </div>
            </ToastProvider>
        </div>
    );
}

export default AdminLayout;
