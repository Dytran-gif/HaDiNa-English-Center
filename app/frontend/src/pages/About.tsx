import PageShell from "../components/layout/PageShell";
import PageBanner from "../components/ui/PageBanner";
import SectionHeading from "../components/ui/SectionHeading";
import StatBlock from "../components/ui/StatBlock";
import TeacherCard from "../components/ui/TeacherCard";
import { siteAbout } from "../data/siteConfig";
import { stats, whyDifferentItems } from "../data/stats";
import { teachers } from "../data/teachers";
import "./About.css";

export default function About() {
  return (
    <PageShell>
      <PageBanner
        kicker="Về chúng tôi"
        title="Môi trường học tập năng động — chuẩn quốc tế"
        description={siteAbout}
      />

      <section className="about-stats container">
        <div className="about-stats__grid">
          {stats.map((s) => (
            <StatBlock value={s.value} label={s.label} key={s.label} />
          ))}
        </div>
      </section>

      <section className="about-values container">
        <SectionHeading
          kicker="Giá trị cốt lõi"
          title="Điều làm nên một Happy IELTS khác biệt"
        />
        <div className="about-values__grid">
          {whyDifferentItems.map((item, i) => (
            <article className="about-values__item" key={item.title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <ul>
                {item.bullets.slice(0, 2).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="about-teachers container">
        <SectionHeading kicker="Đội ngũ" title="Giáo viên tiêu biểu" />
        <div className="about-teachers__grid">
          {teachers.map((t) => (
            <TeacherCard teacher={t} key={t.teacher_id} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
