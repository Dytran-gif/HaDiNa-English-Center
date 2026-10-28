import "./InitialsBlock.css";

interface InitialsBlockProps {
  initials: string;
  tone?: "red" | "green" | "yellow" | "ink";
  size?: "sm" | "md" | "lg";
}

export default function InitialsBlock({
  initials,
  tone = "green",
  size = "md",
}: InitialsBlockProps) {
  return (
    <div className={`initials-block initials-block--${tone} initials-block--${size}`}>
      {initials}
    </div>
  );
}
