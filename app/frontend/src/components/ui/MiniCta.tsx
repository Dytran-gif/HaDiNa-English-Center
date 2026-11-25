import type { ReactNode } from "react";
import Button from "./Button";
import { contactEmail } from "../../data/siteConfig";
import useCenterSettings from "../../services/useCenterSettings";
import "./MiniCta.css";

interface MiniCtaProps {
  title?: string;
  description?: ReactNode;
}

export default function MiniCta({
  title = "Cần tư vấn lộ trình?",
  description = "Để lại thông tin để trung tâm liên hệ tư vấn lộ trình phù hợp.",
}: MiniCtaProps) {
  const { center } = useCenterSettings();
  return (
    <div className="mini-cta">
      <h3>{title}</h3>
      <p>{description}</p>
      <Button to="/dang-ky" variant="primary" className="mini-cta__btn">
        Đăng ký tư vấn
      </Button>
      <div className="mini-cta__contact">
        {center?.phone && <a href={`tel:${center.phone.replace(/[^+\d]/g, "")}`}>{center.phone}</a>}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </div>
    </div>
  );
}
