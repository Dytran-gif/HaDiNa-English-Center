import "./StatBlock.css";

interface StatBlockProps {
  value: string;
  label: string;
}

export default function StatBlock({ value, label }: StatBlockProps) {
  return (
    <div className="stat-block">
      <span className="stat-block__value">{value}</span>
      <span className="stat-block__label">{label}</span>
    </div>
  );
}
