import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { siteName, primaryNav, footerCoursesNav } from "../../data/siteConfig";
import Button from "../ui/Button";
import usePublicTeachers from "../../services/usePublicTeachers";
import usePublicPosts from "../../services/usePublicPosts";
import "./Header.css";
import useCenterSettings from "../../services/useCenterSettings";

type SubLink = { label: string; to: string };

// Mục con đang mở: so cả đường dẫn lẫn query (?category=...), không để NavLink tô xanh tất cả mục
function isCurrent(to: string, pathname: string, search: string) {
  const url = new URL(to, "http://local");
  if (url.pathname !== pathname) return false;
  const want = url.searchParams.toString();
  return want === "" ? search === "" : new URLSearchParams(search).toString() === want;
}

export default function Header() {
  const { center } = useCenterSettings();
  const { pathname, search } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);     // menu con mở bằng nút ▾ (cảm ứng / bàn phím)
  const [mobileSub, setMobileSub] = useState<string | null>(null);   // menu con đang mở trong menu mobile
  const posts = usePublicPosts();
  const { teachers } = usePublicTeachers();
  const submenus: Record<string, SubLink[]> = {
    "/khoa-hoc": footerCoursesNav,
    "/giao-vien": teachers.map(teacher => ({ label: teacher.full_name, to: `/giao-vien/${teacher.slug}` })),
    "/blog": Array.from(new Set(posts.map(post => post.category))).map(category => ({ label: category, to: `/blog?category=${encodeURIComponent(category)}` })),
  };

  // Đổi trang thì đóng mọi menu (tránh menu con còn mở sau khi bấm)
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setMobileSub(null);
  }, [pathname, search]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Bấm ra ngoài / Esc thì đóng menu con đang mở bằng nút ▾
  useEffect(() => {
    if (!openMenu) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && (event.target as Element | null)?.closest?.(".has-dropdown")) return;
      setOpenMenu(null);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [openMenu]);

  return (
    <header className="site-header">
      <div className="site-header__bar container">
        <NavLink to="/" className="site-header__logo">
          {center?.name ?? siteName}
        </NavLink>

        <nav className="site-header__nav" aria-label="Điều hướng chính">
          <ul>
            {primaryNav.map((link) => {
              const items = submenus[link.to] ?? [];
              const hasMenu = items.length > 0;
              return (
                <li key={link.to} className={hasMenu ? `has-dropdown ${openMenu === link.to ? "is-open" : ""}` : ""}>
                  <NavLink to={link.to} end={link.to === "/"}>
                    {link.label}
                  </NavLink>
                  {hasMenu && (
                    <>
                      <button
                        type="button"
                        className="site-header__caret"
                        aria-label={`Mở mục con ${link.label}`}
                        aria-expanded={openMenu === link.to}
                        onClick={() => setOpenMenu(v => (v === link.to ? null : link.to))}
                      >
                        ▾
                      </button>
                      <ul className="dropdown" aria-label={`Mục con ${link.label}`}>
                        {items.map((item) => (
                          <li key={item.to}>
                            <Link
                              to={item.to}
                              className={isCurrent(item.to, pathname, search) ? "is-current" : ""}
                              aria-current={isCurrent(item.to, pathname, search) ? "page" : undefined}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              );
            })}
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
          aria-controls="site-mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Một khối con duy nhất trong grid để thu gọn được cả danh sách lẫn 2 nút (trước đây 2 nút luôn hiện) */}
      <div id="site-mobile-menu" className={`site-header__mobile ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="site-header__mobile-inner">
          <ul>
            {primaryNav.map((link) => {
              const items = submenus[link.to] ?? [];
              return (
                <li key={link.to} className={items.length ? "has-sub" : ""}>
                  <div className="site-header__mobile-row">
                    <NavLink to={link.to} end={link.to === "/"} tabIndex={mobileOpen ? 0 : -1}>
                      {link.label}
                    </NavLink>
                    {items.length > 0 && (
                      <button
                        type="button"
                        className="site-header__mobile-toggle"
                        aria-expanded={mobileSub === link.to}
                        aria-label={`Mục con ${link.label}`}
                        tabIndex={mobileOpen ? 0 : -1}
                        onClick={() => setMobileSub(v => (v === link.to ? null : link.to))}
                      >
                        <span aria-hidden="true">▾</span>
                      </button>
                    )}
                  </div>
                  {items.length > 0 && mobileSub === link.to && (
                    <ul className="site-header__mobile-sub">
                      {items.map(item => (
                        <li key={item.to}>
                          <Link to={item.to} className={isCurrent(item.to, pathname, search) ? "is-current" : ""}>{item.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="site-header__mobile-actions">
            <Button to="/dang-nhap" variant="outline">
              Đăng nhập
            </Button>
            <Button to="/dang-ky" variant="primary">
              Đăng ký
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
