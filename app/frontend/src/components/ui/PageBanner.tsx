import type { ReactNode } from "react";
import "./PageBanner.css";

interface PageBannerProps {
  kicker: string;
  title: ReactNode;
  description?: string;
}

export default function PageBanner({ kicker, title, description }: PageBannerProps) {
  return (
    <div className="page-banner">
      <div className="container">
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
