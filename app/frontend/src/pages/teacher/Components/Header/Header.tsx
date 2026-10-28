import { useLocation } from "react-router-dom";
import "./Header.css";

import { teacherPageTitles } from "../../../../data/TeacherData/pageTitles";
import { useAuth } from "../../../../context/AuthContext";
import type { PageTitle } from "../../../../types";

function Header() {
    const location = useLocation();
    const { user } = useAuth();

    const page: PageTitle = teacherPageTitles[location.pathname] || {
        title: "Teacher",
        subtitle: "Trang giáo viên.",
    };

    return (
        <header className="teacher-header">
            <div className="header-title">
                <h1>{page.title}</h1>
                <p>{page.subtitle}</p>
            </div>

            <div className="header-user">
                <div className="user-avatar">
                    {user ? user.full_name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="user-info">
                    <strong>{user?.full_name ?? "Chưa đăng nhập"}</strong>
                    <span>{user?.email}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
