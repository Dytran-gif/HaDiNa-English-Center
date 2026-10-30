import type { ComponentProps } from "react";
import BaseButton from "../../../../components/ui/Button";
import Icon from "./Icon";
import type { IconName } from "./types";
type Props = Omit<ComponentProps<typeof BaseButton>, "variant"> & {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  loading?: boolean; icon?: IconName;
};
export default function Button({ variant = "secondary", loading = false, disabled, icon, className = "", children, to, type = "button", ...rest }: Props) {
  const blocked = disabled || loading;
  const content = <>{loading ? <span className="admin-spinner" aria-hidden="true"/> : icon ? <Icon name={icon}/> : null}<span>{children}</span></>;
  // Render a real disabled button instead of an anchor that still navigates.
  return <BaseButton {...rest} to={blocked ? undefined : to} type={type} variant={variant === "primary" ? "primary" : variant === "ghost" ? "ghost" : "outline"} disabled={blocked} aria-busy={loading || undefined} className={`admin-button admin-button--${variant === "outline" ? "secondary" : variant} ${className}`.trim()}>{content}</BaseButton>;
}
export function IconButton({ label, icon, ...rest }: Omit<Props, "children" | "icon"> & { label: string; icon: IconName }) {
  return <Button {...rest} icon={icon} title={label} aria-label={label} className={`admin-icon-button ${rest.className ?? ""}`}><span className="admin-sr-only">{label}</span></Button>;
}
