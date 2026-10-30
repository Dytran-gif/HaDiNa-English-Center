import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";
import ToastProvider from "../Components/Ui/ToastProvider";
import Dialog from "../Components/Ui/Dialog";
import Button from "../Components/Ui/Button";
import Notice from "../Components/Ui/Notice";

import "./AdminLayout.css";
import "../Components/Api/AdminApi.css";
import "../Components/Ui/AdminTokens.css";
import "../Components/Ui/AdminUi.css";
import "../Components/Ui/AdminPanels.css";

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
                    {(!token || illustrative) && <div className="admin-content-notice"><Notice tone="info" action={!token ? <Button to="/dang-nhap" variant="secondary">Đăng nhập tài khoản thật</Button> : undefined}>
                        {!token ? `Bạn đang xem chế độ demo.${illustrative ? " Dữ liệu trên trang này chỉ để minh họa." : ""} Đăng nhập bằng máy chủ để xem và lưu dữ liệu thật.` : "Dữ liệu trên trang này chỉ để minh họa, chưa kết nối với dữ liệu quản lý thật."}
                    </Notice></div>}
                    <Outlet />
                </main>
            </div>
            </ToastProvider>
        </div>
    );
}

export default AdminLayout;
