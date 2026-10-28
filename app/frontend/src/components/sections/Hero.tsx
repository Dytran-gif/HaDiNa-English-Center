import Button from "../ui/Button";
import Tag from "../ui/Tag";
import { heroUsps } from "../../data/stats";
import "./Hero.css";

const scoreHighlights = [
  { score: "9.0", label: "IELTS" },
  { score: "8.5", label: "IELTS" },
  { score: "1500", label: "SAT" },
];

const partners = ["IDP", "British Council", "Cambridge"];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <span className="kicker">Trung tâm Anh ngữ</span>
          <h1 className="hero__title">
            Trung tâm Anh Ngữ
            <br />
            <span className="hero__title--accent">HAPPY IELTS</span>
          </h1>

          <ul className="hero__usps">
            {heroUsps.map((usp) => (
              <li key={usp}>{usp}</li>
            ))}
          </ul>

          <div className="hero__actions">
            <Button to="/dang-ky" variant="primary">
              Đăng ký ngay →
            </Button>
            <Button to="/khoa-hoc" variant="outline">
              Xem khoá học
            </Button>
          </div>

          <div className="hero__partners">
            <p>Hợp tác với các tổ chức giáo dục hàng đầu</p>
            <div className="hero__partners-list">
              {partners.map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__visual-block">
            <span className="hero__visual-word">HAPPY</span>
          </div>
          {scoreHighlights.map((s, i) => (
            <div className={`hero__score hero__score--${i}`} key={s.label + i}>
              <span className="hero__score-value">{s.score}</span>
              <span className="hero__score-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
