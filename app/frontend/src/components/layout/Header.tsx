import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { siteName, primaryNav, footerCoursesNav } from "../../data/siteConfig";
import Button from "../ui/Button";
import "./Header.css";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <div className="site-header__bar container">
        <NavLink to="/" className="site-header__logo" onClick={() => setMobileOpen(false)}>
          {siteName}
        </NavLink>

        <nav className="site-header__nav" aria-label="Điều hướng chính">
          <ul>
            {primaryNav.map((link) => (
              <li key={link.to} className={link.label === "Khoá học" ? "has-dropdown" : ""}>
                <NavLink to={link.to} end={link.to === "/"}>
                  {link.label}
                </NavLink>
                {link.label === "Khoá học" && (
                  <ul className="dropdown">
                    {footerCoursesNav.map((course) => (
                      <li key={course.to}>
                        <NavLink to={course.to}>{course.label}</NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Button to="/dang-nhap" variant="outline">
            Đăng nhập
          </Button>
          <Button to="/dang-ky" variant="primary">
            Đăng ký
          </Button>
        </div>

        <button
          type="button"
          className={`site-header__burger ${mobileOpen ? "is-open" : ""}`}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`site-header__mobile ${mobileOpen ? "is-open" : ""}`}>
        <ul>
          {primaryNav.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} onClick={() => setMobileOpen(false)}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="site-header__mobile-actions">
          <Button to="/dang-nhap" variant="outline" onClick={() => setMobileOpen(false)}>
            Đăng nhập
          </Button>
          <Button to="/dang-ky" variant="primary" onClick={() => setMobileOpen(false)}>
            Đăng ký
          </Button>
        </div>
      </div>
    </header>
  );
}
