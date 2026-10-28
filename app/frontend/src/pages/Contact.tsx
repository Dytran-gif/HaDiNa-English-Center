import { useState, type FormEvent } from "react";
import PageShell from "../components/layout/PageShell";
import PageBanner from "../components/ui/PageBanner";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { InputField, TextareaField } from "../components/ui/FormField";
import { offices, contactEmail, contactPhone } from "../data/siteConfig";
import "./Contact.css";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <PageShell>
      <PageBanner
        kicker="Liên hệ"
        title="Liên hệ với Happy IELTS"
        description="Gửi câu hỏi hoặc yêu cầu tư vấn, đội ngũ Happy IELTS sẽ phản hồi trong thời gian sớm nhất."
      />
      <div className="container contact-grid">
        <Card className="contact-form-card">
          {submitted ? (
            <div className="contact-success">
              <h2>Gửi liên hệ thành công!</h2>
              <p>Cảm ơn bạn đã liên hệ. Happy IELTS sẽ phản hồi trong vòng 24 giờ.</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Gửi liên hệ khác
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <InputField
                label="Họ và tên"
                id="contact-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <InputField
                label="Email"
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextareaField
                label="Nội dung"
                id="contact-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" variant="primary">
                Gửi liên hệ
              </Button>
            </form>
          )}
        </Card>

        <div className="contact-offices">
          <h3>Địa chỉ liên hệ</h3>
          {offices.map((office) => (
            <div key={office.city} className="contact-offices__item">
              <span className="kicker">{office.city}</span>
              {office.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ))}
          <div className="contact-offices__item">
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            <br />
            <a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
