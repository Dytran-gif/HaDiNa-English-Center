import StatBlock from "../ui/StatBlock";
import { stats } from "../../data/stats";
import "./TrustStats.css";

export default function TrustStats() {
  return (
    <section className="trust-stats">
      <div className="container trust-stats__grid">
        {stats.map((s) => (
          <StatBlock value={s.value} label={s.label} key={s.label} />
        ))}
      </div>
    </section>
  );
}
