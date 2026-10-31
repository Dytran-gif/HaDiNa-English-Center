import type { ReactNode } from "react";
import Icon from "./Icon";
import type { IconName, Tone } from "./types";
const icons: Record<Tone, IconName> = { info: "info", success: "check", warning: "warning", error: "error", neutral: "info" };
export default function Notice({ tone = "info", title, children, action, inlineAction = false }: { tone?: Tone; title?: string; children?: ReactNode; action?: ReactNode; inlineAction?: boolean }) {
  return <div className={`admin-notice admin-tone--${tone}${inlineAction ? " admin-notice--inline" : ""}`} role={tone === "error" ? "alert" : "status"}>
    <Icon name={icons[tone]}/><div className="admin-notice-content">{title && <strong>{title}</strong>}{children && <div>{children}</div>}{action && !inlineAction && <div className="admin-notice-action">{action}</div>}</div>
    {action && inlineAction && <div className="admin-notice-action">{action}</div>}
  </div>;
}
