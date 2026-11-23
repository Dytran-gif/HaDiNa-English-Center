import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";
import { LanguageProvider } from "../../../i18n/LanguageContext";

import "./StudentLayout.css";

function StudentLayout() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <LanguageProvider>
            <div className="student-layout">
                <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

                {menuOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
                )}

                <div className="student-main">
                    <Header onOpenMenu={() => setMenuOpen(true)} />

                    <main className="student-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </LanguageProvider>
    );
}

export default StudentLayout;
