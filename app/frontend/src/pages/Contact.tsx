import { useState, type FormEvent } from "react";
import PageShell from "../components/layout/PageShell";
import PageBanner from "../components/ui/PageBanner";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { InputField, TextareaField } from "../components/ui/FormField";
import { contactEmail, siteName } from "../data/siteConfig";
import useCenterSettings from "../services/useCenterSettings";
import "./Contact.css";

export default function Contact() {
  const { center, loading, error, reload } = useCenterSettings();
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
        title={`Liên hệ với ${center?.name ?? siteName}`}
        description={`Gửi câu hỏi hoặc yêu cầu tư vấn, đội ngũ ${center?.name ?? siteName} sẽ phản hồi trong thời gian sớm nhất.`}
      />
      <div className="container contact-grid">
        <Card className="contact-form-card">
          {submitted ? (
            <div className="contact-success">
              <h2>Thông tin chưa được gửi</h2>
              <p>Biểu mẫu này chưa hỗ trợ gửi tin. Bạn có thể gọi số điện thoại trung tâm hoặc dùng form tư vấn trên trang chủ.</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Quay lại biểu mẫu
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p role="note">Biểu mẫu này chưa gửi tin; bạn có thể gọi trực tiếp hoặc dùng form tư vấn trên trang chủ.</p>
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
          {loading && !center && <p role="status">Đang tải thông tin trung tâm…</p>}
          {error && <div role="alert"><p>{error}</p><Button onClick={() => { void reload(); }}>Thử lại</Button></div>}
          {center && <div className="contact-offices__item"><span className="kicker">{center.name}</span><p>{center.address || "Chưa cập nhật địa chỉ"}</p></div>}
          <div className="contact-offices__item">
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            <br />
            {center?.phone && <a href={`tel:${center.phone.replace(/[^+\d]/g, "")}`}>{center.phone}</a>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
