import Button from "../ui/Button";
import { siteAbout } from "../../data/siteConfig";
import "./AboutTeaser.css";

export default function AboutTeaser() {
  return (
    <section className="about-teaser">
      <div className="container about-teaser__grid">
        <div className="about-teaser__visual" aria-hidden="true">
          <span>01</span>
          <span>02</span>
          <span>03</span>
          <span>04</span>
        </div>
        <div className="about-teaser__copy">
          <span className="kicker">Về chúng tôi</span>
          <h2>Môi trường học tập năng động — chuẩn quốc tế</h2>
          <p>{siteAbout}</p>
          <Button to="/ve-chung-toi" variant="outline">
            Tìm hiểu về Happy IELTS →
          </Button>
        </div>
      </div>
    </section>
  );
}
