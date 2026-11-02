import "./Header.css";
import {Link, useLocation} from "react-router-dom";

import {
studentUser,
} from "../../../../data/StudentData/HeaderData";

function Header() {
    const location = useLocation();

    const pageTitles: Record<string, string> = {
        "/student/dashboard": "Dashboard Overview",
        "/student/courses": "Enrollment Courses",
        "/student/schedule": "My Schedule", 
        "/student/tuition": "My Payments",
        "/student/feedback": "Feedback and Support",
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