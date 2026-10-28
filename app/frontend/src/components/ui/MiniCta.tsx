import type { ReactNode } from "react";
import Button from "./Button";
import { contactEmail, contactPhone } from "../../data/siteConfig";
import "./MiniCta.css";

interface MiniCtaProps {
  title?: string;
  description?: ReactNode;
}

export default function MiniCta({
  title = "Cần tư vấn lộ trình?",
  description = "Để lại thông tin, Happy IELTS sẽ liên hệ tư vấn miễn phí trong 24 giờ.",
}: MiniCtaProps) {
  return (
    <div className="mini-cta">
      <h3>{title}</h3>
      <p>{description}</p>
      <Button to="/dang-ky" variant="primary" className="mini-cta__btn">
        Đăng ký tư vấn
      </Button>
      <div className="mini-cta__contact">
        <a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a>
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </div>
    </div>
  );
}
