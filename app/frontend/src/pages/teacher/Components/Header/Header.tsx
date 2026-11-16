import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import "../../teacher-shared.css";

import { findTeacherPageTitle } from "../../../../data/TeacherData/pageTitles";
import { useAuth } from "../../../../context/AuthContext";
import { assetUrl } from "../../../../services/apiClient";
import { useTeacherQuery } from "../../../../services/teacher/teacherApi";
import type { PageTitle } from "../../../../types";
import type { TeacherProfile } from "../../../../types/teacherApi";

function Header() {
    const location = useLocation();
    const { user, token } = useAuth();
    const { data: profile } = useTeacherQuery<TeacherProfile>(token ? "profile" : null);

    const page: PageTitle = findTeacherPageTitle(location.pathname) ?? { title: "Teacher", subtitle: "Trang giáo viên." };
    const name = profile?.fullName ?? user?.full_name ?? "Chưa đăng nhập";
    const avatar = assetUrl(profile?.avatarUrl);

    return (
        <header className="teacher-header">
            <div className="header-title">
                <h1>{page.title}</h1>
                <p>{page.subtitle}</p>
            </div>

            <div className="header-user">
                <Link to="/teacher/profile" className="user-avatar" style={{ overflow: "hidden", textDecoration: "none" }}>
                    {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name.charAt(0).toUpperCase()}
                </Link>
                <div className="user-info">
                    <strong>{name}</strong>
                    <span>{user?.email}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
