import { useState } from "react";
import { assetUrl } from "../../../../services/apiClient";
import "./AdminAvatar.css";

export default function AdminAvatar({ url, name, className }: { url?: string | null; name: string; className: string }) {
  const [failed, setFailed] = useState<string>();
  const src = assetUrl(url);
  return <span className={className} aria-hidden="true">{src && failed !== src ? <img className="admin-avatar-image" src={src} alt="" onError={() => setFailed(src)}/> : name.charAt(0).toUpperCase()}</span>;
}
