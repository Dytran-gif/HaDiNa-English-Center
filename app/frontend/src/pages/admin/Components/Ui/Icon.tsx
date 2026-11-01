import type { ReactNode } from "react";
import type { IconName } from "./types";
const shapes: Record<IconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  book: <><path d="M12 6c-3-3-7-3-10-1v15c3-2 7-2 10 1 3-3 7-3 10-1V5c-3-2-7-2-10 1Z"/><path d="M12 6v15"/></>,
  teachers: <><path d="m2 8 10-5 10 5-10 5Z"/><path d="M6 11v5c4 3 8 3 12 0v-5M22 8v7"/></>,
  students: <><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/></>,
  classes: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h3M14 13h3M7 17h3"/></>,
  requests: <><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9zM9 11h6M9 15h6M9 19h3"/></>,
  blog: <><path d="M14 4H4v17h17V11M14 4l3-3 6 6-3 3M10 14l3-7 7 3-7 3Z"/></>,
  payments: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
  reports: <><path d="M3 3v18h18M7 16v-4M12 16V7M17 16V4"/></>,
  rooms: <><path d="M4 21V4l12-2v19M16 7h4v14M2 21h20M12 12h.01"/></>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
  logout: <><path d="M10 4H4v16h6M10 12h12m-5-5 5 5-5 5"/></>, plus: <path d="M12 5v14M5 12h14"/>,
  check: <path d="m5 12 4 4L19 6"/>, info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
  warning: <><path d="m12 3 10 18H2Z"/><path d="M12 9v5M12 17h.01"/></>, error: <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m-6 0 6-6"/></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
  edit: <><path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/></>,
  eye: <><path d="M2 12c5-9 15-9 20 0-5 9-15 9-20 0Z"/><circle cx="12" cy="12" r="3"/></>,
  "eye-off": <><path d="m3 3 18 18M9 5c5-1 10 2 13 7l-3 4M6 6 2 12c4 7 11 9 16 5M10 10l4 4"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>, refresh: <><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></>,
  "chevron-left": <path d="m15 5-7 7 7 7"/>, "chevron-right": <path d="m9 5 7 7-7 7"/>,
  empty: <><path d="m3 9 4-6h10l4 6v12H3Z"/><path d="M3 9h5l2 4h4l2-4h5"/></>,
};
export default function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg className={`admin-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shapes[name]}</svg>;
}
