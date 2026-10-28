import { Outlet } from "react-router-dom";

import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";

import "./AdminLayout.css";

function AdminLayout() {
    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-main">
                <Header />
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
