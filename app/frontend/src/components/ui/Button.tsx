import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Button.css";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: Variant;
  to?: string;
  children: ReactNode;
  onClick?: () => void;
}

export default function Button({
  variant = "primary",
  to,
  className = "",
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = `btn btn--${variant} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
