import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { siteName, primaryNav, footerCoursesNav } from "../../data/siteConfig";
import Button from "../ui/Button";
import usePublicTeachers from "../../services/usePublicTeachers";
import usePublicPosts from "../../services/usePublicPosts";
import "./Header.css";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const posts = usePublicPosts();
  const { teachers } = usePublicTeachers();
  const submenus: Record<string, { label: string; to: string }[]> = {
    "/khoa-hoc": footerCoursesNav,
    "/giao-vien": teachers.map(teacher => ({ label: teacher.full_name, to: `/giao-vien/${teacher.slug}` })),
    "/blog": Array.from(new Set(posts.map(post => post.category))).map(category => ({ label: category, to: `/blog?category=${encodeURIComponent(category)}` })),
  };

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
              <li key={link.to} className={submenus[link.to]?.length ? "has-dropdown" : ""}>
                <NavLink to={link.to} end={link.to === "/"}>
                  {link.label}
                </NavLink>
                {Boolean(submenus[link.to]?.length) && (
                  <ul className="dropdown" aria-label={`Mục con ${link.label}`}>
                    {submenus[link.to].map((course) => (
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
