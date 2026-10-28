import type { ReactNode } from "react";
import "./Tag.css";

interface TagProps {
  children: ReactNode;
  tone?: "ink" | "red" | "yellow" | "green";
}

export default function Tag({ children, tone = "ink" }: TagProps) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}
