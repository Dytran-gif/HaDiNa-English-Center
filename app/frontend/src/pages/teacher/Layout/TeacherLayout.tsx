import { Outlet } from "react-router-dom";

import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";

import "./TeacherLayout.css";

function TeacherLayout() {
    return (
        <div className="teacher-layout">
            <Sidebar />
            <div className="teacher-main">
                <Header />
                <main className="teacher-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default TeacherLayout;
