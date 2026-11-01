import Button from "./Button";
interface QuickAction { label: string; to: string; primary?: boolean }
export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return <section className="admin-quick-actions" aria-label="Thao tác nhanh">
    <h2>Thao tác nhanh</h2>
    <div className="admin-quick-actions-list">{actions.map(action => <Button key={action.to} to={action.to} variant={action.primary ? "primary" : "secondary"} icon="plus">{action.label}</Button>)}</div>
  </section>;
}
