import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../../styles/public-theme.css";

interface PageShellProps {
  children: ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="page-shell">
      <Header />
      <main className="page-shell__main">{children}</main>
      <Footer />
    </div>
  );
}