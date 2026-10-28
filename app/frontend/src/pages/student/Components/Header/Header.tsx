import "./Header.css";
import {Link, useLocation} from "react-router-dom";

import {
    notificationData,
    studentUser,
} from "../../../../data/StudentData/HeaderData";

function Header() {
    const location = useLocation();

    const pageTitles: Record<string, string> = {
        "/student/dashboard": "Dashboard Overview",
        "/student/skill": "Skill Details",
        "/student/practice": "Practice Exercises",
    };

    const title = pageTitles[location.pathname] ?? "Dashboard";
    return (
        <header className="student-header">
            {/* LEFT - TITLE */}
            <div className="header-title">
                <h1>{title}</h1>
                <p>Welcome to Class, {studentUser.name}! <i className="fa-solid fa-hand-sparkles"></i></p>
            </div>

            {/* RIGHT */}
            <div className="header-right">
                {/* SEARCH */}
                <div className="header-search">
                    <input
                        type="text"
                        placeholder="Search anything..."
                    />

                    <Link
                        to="/search"
                        className="search-link"
                    >
                        {/* Dùng thẻ i của HTML thuần */}
                        <span className="search-icon">
                           <i className="fa-brands fa-sistrix" ></i>
                        </span>
                    </Link>
                </div>

                {/* NOTIFICATION */}
                <button
                    type="button"
                    className="notification-button"
                >
                    {/* Dùng thẻ i của HTML thuần */}
                    <i className="fa-solid fa-bell"></i>

                    {notificationData.unreadCount > 0 && (
                        <span className="notification-badge">
                            {notificationData.unreadCount}
                        </span>
                    )}
                </button>

                {/* USER */}
                <div className="header-user">
                    <div className="user-avatar">
                        {studentUser.avatar}
                    </div>

                    <div className="user-info">
                        <strong>{studentUser.name}</strong>
                        <span>{studentUser.email}</span>
                    </div>

                    {/* Dùng thẻ i của HTML thuần */}
                    <span className="user-arrow">
                        <i className="fa-regular fa-circle-up fa-flip-vertical"></i>
                    </span>
                </div>
            </div>
        </header>
    );
}

export default Header;