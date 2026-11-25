import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { primaryNav } from "../../data/siteConfig";
import useBrandName from "../../services/useBrandName";
import "../../styles/public-theme.css";

interface PageShellProps {
  children: ReactNode;
  title?: string; // tiêu đề trang cho tab trình duyệt; bỏ trống thì lấy theo menu
}

const extraTitles: Record<string, string> = { "/dang-nhap": "Đăng nhập", "/dang-ky": "Đăng ký học" };

export default function PageShell({ children, title }: PageShellProps) {
  const { pathname } = useLocation();
  const brand = useBrandName();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Tab trình duyệt: "<trang> | <tên trung tâm>" (trước đây luôn là "Happy IELTS — ...")
  useEffect(() => {
    const nav = primaryNav.filter(n => n.to !== "/").find(n => pathname === n.to || pathname.startsWith(n.to + "/"));
    const page = title ?? extraTitles[pathname] ?? nav?.label;
    document.title = page ? `${page} | ${brand}` : brand;
  }, [pathname, title, brand]);

  return (
    <div className="page-shell">
      <Header />
      <main className="page-shell__main">{children}</main>
      <Footer />
    </div>
  );
}
