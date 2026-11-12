import Button from "../ui/Button";
import { siteAbout } from "../../data/siteConfig";
import AbouTeaser1 from "../../assets/images/AbouTeaser1.jpg";
import AbouTeaser2 from "../../assets/images/AbouTeaser2.jpg";
import AbouTeaser3 from "../../assets/images/AbouTeaser3.jpg";
import AbouTeaser4 from "../../assets/images/AbouTeaser4.jpg";
import "./AboutTeaser.css";

const visualItems = [
  { id: "01", img: AbouTeaser1 },
  { id: "02", img: AbouTeaser2 },
  { id: "03", img: AbouTeaser3 },
  { id: "04", img: AbouTeaser4 },
];

export default function AboutTeaser() {
  return (
    <section className="about-teaser">
      <div className="container about-teaser__grid">
        <div className="about-teaser__visual" aria-hidden="true">
          {visualItems.map((item) => (
            <span
              key={item.id}
              style={{ overflow: "hidden", padding: 0 }}
            >
              <img
                src={item.img}
                alt={`Học tập tại Hadi IELTS ${item.id}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </span>
          ))}
        </div>

        <div className="about-teaser__copy">
          <span className="kicker">Về chúng tôi</span>
          <h2>Môi trường học tập năng động — chuẩn quốc tế</h2>
          <p>{siteAbout}</p>
          <Button to="/ve-chung-toi" variant="outline">
            Tìm hiểu về Hadi IELTS →
          </Button>
        </div>
      </div>
    </section>
  );
}