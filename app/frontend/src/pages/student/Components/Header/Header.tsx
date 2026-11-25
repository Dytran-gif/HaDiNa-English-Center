import { useLocation, useNavigate } from "react-router-dom";
import { useStudentProfile } from "../../../../services/student/useStudentApi";
import { assetUrl } from "../../../../services/apiClient";
import { useLang } from "../../../../i18n/LanguageContext";
import LanguageSwitch from "./LanguageSwitch";
import "./Header.css";

interface HeaderProps {
    onOpenMenu?: () => void; // mobile: mở drawer sidebar
}

function Header({ onOpenMenu }: HeaderProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLang();

    // Hồ sơ học viên đang đăng nhập — chỉ để hiện tên/avatar, sửa gì thì vào trang Hồ sơ
    const { data: profile } = useStudentProfile();

    const displayName = profile?.fullName ?? "";
    const displayEmail = profile?.email ?? "";
    const avatar = assetUrl(profile?.avatarUrl) || '';

    const pageTitleKeys: Record<string, string> = {
        "/student/dashboard": "page.dashboard",
        "/student/courses": "page.courses",
        "/student/schedule": "page.schedule",
        "/student/tuition": "page.tuition",
        "/student/feedback": "page.feedback",
        "/student/profile": "page.profile",
    };

    const title = t(pageTitleKeys[location.pathname] ?? "page.dashboard");

    return (
        <header className="student-header">
            <button
                type="button"
                className="header-menu-btn"
                onClick={onOpenMenu}
                aria-label="Open menu"
            >
                <i className="fa-solid fa-bars"></i>
            </button>

            <div className="header-title">
                <h1>{title}</h1>
                <p>
                    {t("header.welcome", { name: displayName })}{" "}
                    <i className="fa-solid fa-hand-sparkles"></i>
                </p>
            </div>

            <div className="header-right">
                <LanguageSwitch />

                <button
                    type="button"
                    className="header-user"
                    onClick={() => navigate("/student/profile")}
                    title={t("profile.title")}
                >
                    <div className="user-avatar">
                        {avatar ? <img src={avatar} alt="Avatar" className="avatar-img" /> : "👨‍💻"}
                    </div>

                    <div className="user-info">
                        <strong>{displayName}</strong>
                        <span>{displayEmail}</span>
                    </div>

                    <span className="user-arrow">
                        <i className="fa-solid fa-arrow-right"></i>
                    </span>
                </button>
            </div>
        </header>
    );
}

export default Header;
