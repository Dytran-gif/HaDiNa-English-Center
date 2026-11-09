import Button from "../ui/Button";
import { siteName } from "../../data/siteConfig";
import "./Hero.css";

const steps = [
  { number: "01", title: "Hiểu đúng điểm xuất phát", text: "Xác định trình độ và mục tiêu bạn muốn đạt được." },
  { number: "02", title: "Học theo lộ trình phù hợp", text: "Xây nền tảng, luyện kỹ năng và thực hành từng bước." },
  { number: "03", title: "Nhìn thấy sự tiến bộ", text: "Ôn tập, nhận góp ý và điều chỉnh cách học." },
];

export default function Hero() {
  return <section className="hero">
    <div className="container hero__grid">
      <div className="hero__copy">
        <span className="kicker">{siteName} · Học để tự tin hơn</span>
        <h1 className="hero__title">Mỗi mục tiêu tiếng Anh,<br/><span className="hero__title--accent">một lộ trình phù hợp.</span></h1>
        <p className="hero__intro">Từ xây nền tảng đến luyện thi IELTS, SAT — tìm chương trình phù hợp với trình độ, thời gian và mục tiêu của bạn.</p>
        <div className="hero__actions">
          <Button to="/khoa-hoc" variant="primary">Khám phá khóa học →</Button>
          <a className="hero__survey-link" href="#course-survey">Giúp tôi chọn khóa học ↗</a>
        </div>
        <div className="hero__topics" aria-label="Chương trình đào tạo"><span>IELTS</span><span>SAT</span><span>Tiếng Anh thiếu nhi</span></div>
      </div>
      <div className="hero__roadmap">
        <div className="hero__roadmap-heading"><span className="kicker">Hành trình của bạn</span><span className="hero__roadmap-mark" aria-hidden="true">↗</span></div>
        <h2>Bắt đầu từ hôm nay.<br/>Tiến bộ từng bước.</h2>
        <ol>{steps.map(step => <li key={step.number}><span className="hero__step-number" aria-hidden="true">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
        <p className="hero__roadmap-note">Chọn mục tiêu của bạn. Cùng tìm cách học phù hợp.</p>
      </div>
    </div>
  </section>;
}
