import { useId, type ReactNode } from "react";
import Card from "../../../../components/ui/Card";
export default function SectionCard({ title, children, action, className = "" }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  const titleId = useId();
  return <Card padded={false} className={`admin-section-card ${className}`} role="region" aria-labelledby={titleId}>
    <div className="admin-section-card-header"><h2 id={titleId}>{title}</h2>{action && <div className="admin-section-card-action">{action}</div>}</div>
    <div className="admin-section-card-body">{children}</div>
  </Card>;
}
