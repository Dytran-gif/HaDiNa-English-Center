import { useEffect, useRef, type ReactNode } from "react";

export default function ActionMenu({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const details = ref.current;
    const menu = panel.current;
    if (!details || !menu) return;
    const position = () => {
      if (!details.open) return;
      const anchor = details.querySelector("summary")!.getBoundingClientRect();
      const box = menu.getBoundingClientRect();
      const left = Math.max(8, Math.min(anchor.right - box.width, window.innerWidth - box.width - 8));
      const below = anchor.bottom + 8;
      const top = below + box.height <= window.innerHeight - 8 ? below : Math.max(8, anchor.top - box.height - 8);
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    };
    const toggle = (event: Event) => {
      if (event.target !== details) return;
      if (details.open) { menu.showPopover(); position(); }
      else if (menu.matches(":popover-open")) menu.hidePopover();
    };
    details.addEventListener("toggle", toggle);
    window.addEventListener("resize", position);
    document.addEventListener("scroll", position, true);
    return () => {
      details.removeEventListener("toggle", toggle);
      window.removeEventListener("resize", position);
      document.removeEventListener("scroll", position, true);
      if (menu.matches(":popover-open")) menu.hidePopover();
    };
  }, []);
  return <details ref={ref} className="admin-action-menu" name="admin-row-actions" onKeyDown={event => {
    if (event.key === "Escape" && ref.current?.open) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); event.stopPropagation(); }
  }}>
    <summary aria-label={`Tùy chọn: ${label}`}>Tùy chọn</summary>
    <div ref={panel} popover="manual" className="admin-action-popover" aria-label={`Tùy chọn: ${label}`} onClick={() => { if (ref.current) { panel.current?.hidePopover(); ref.current.open = false; ref.current.querySelector("summary")?.focus(); } }}>{children}</div>
  </details>;
}
