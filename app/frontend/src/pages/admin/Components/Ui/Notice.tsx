import type { ReactNode } from "react";
import Icon from "./Icon";
import type { IconName, Tone } from "./types";
const icons: Record<Tone, IconName> = { info: "info", success: "check", warning: "warning", error: "error", neutral: "info" };
export default function Notice({ tone = "info", title, children, action }: { tone?: Tone; title?: string; children?: ReactNode; action?: ReactNode }) {
  return <div className={`admin-notice admin-tone--${tone}`} role={tone === "error" ? "alert" : "status"}>
    <Icon name={icons[tone]}/><div className="admin-notice-content">{title && <strong>{title}</strong>}{children && <div>{children}</div>}{action && <div className="admin-notice-action">{action}</div>}</div>
  </div>;
}
