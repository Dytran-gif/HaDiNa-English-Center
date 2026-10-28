import SectionHeading from "../ui/SectionHeading";
import { whyDifferentItems } from "../../data/stats";
import { siteAbout } from "../../data/siteConfig";
import "./WhyDifferent.css";

export default function WhyDifferent() {
  return (
    <section className="why-different">
      <div className="container">
        <SectionHeading
          kicker="Vì sao chọn Happy IELTS"
          title="Điều gì làm cho Happy IELTS khác biệt"
          description={siteAbout}
        />

        <div className="why-different__grid">
          {whyDifferentItems.map((item, i) => (
            <article className="why-different__item" key={item.title}>
              <span className="why-different__index">{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
