import { useRef, type ReactNode } from "react";

export default function ActionMenu({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return <details ref={ref} className="admin-action-menu" name="admin-row-actions" onKeyDown={event => {
    if (event.key === "Escape" && ref.current?.open) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); event.stopPropagation(); }
  }}>
    <summary aria-label={`Tùy chọn: ${label}`}>Tùy chọn</summary>
    <div onClick={() => { if (ref.current) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); } }}>{children}</div>
  </details>;
}
