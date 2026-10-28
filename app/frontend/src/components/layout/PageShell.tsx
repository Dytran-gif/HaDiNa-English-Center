import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "../../styles/public-theme.css";

interface PageShellProps {
  children: ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-shell__main">{children}</main>
      <Footer />
    </div>
  );
}
