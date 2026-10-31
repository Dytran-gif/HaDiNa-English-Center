import type { ReactNode } from "react";
import Icon from "./Icon";
import type { IconName } from "./types";
export default function EmptyState({ title = "Chưa có dữ liệu", description = "Dữ liệu sẽ xuất hiện tại đây khi được bổ sung.", icon = "empty", action }: { title?: string; description?: string; icon?: IconName; action?: ReactNode }) {
  return <div className="admin-empty-state"><span className="admin-empty-icon"><Icon name={icon}/></span><h3>{title}</h3><p>{description}</p>{action && <div className="admin-empty-action">{action}</div>}</div>;
}
