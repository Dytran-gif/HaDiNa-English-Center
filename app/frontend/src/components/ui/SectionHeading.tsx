import type { ReactNode } from "react";
import "./SectionHeading.css";

interface SectionHeadingProps {
  kicker?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {kicker && <span className="kicker">{kicker}</span>}
      <h2 className="section-heading__title">{title}</h2>
      {description && <p className="section-heading__desc">{description}</p>}
    </div>
  );
}
