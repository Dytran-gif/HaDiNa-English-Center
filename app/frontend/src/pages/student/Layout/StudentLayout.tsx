import { Outlet } from "react-router-dom";

import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";

import "./StudentLayout.css";

function StudentLayout() {
    return (
        <div className="student-layout">
            <Sidebar />

            <div className="student-main">
                <Header />

                <main className="student-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default StudentLayout;