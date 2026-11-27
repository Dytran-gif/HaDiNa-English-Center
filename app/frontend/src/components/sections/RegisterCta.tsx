import ConsultationForm from "../ui/ConsultationForm";
import "./RegisterCta.css";

export default function RegisterCta() {
  return (
    <section className="register-cta" id="dang-ky-tu-van">
      <div className="container register-cta__inner">
        <div className="register-cta__copy">
          <span className="kicker kicker--light">Đăng ký tư vấn</span>
          <h2>Đăng kí tư vấn miễn phí</h2>
          <p>
            Xây dựng lộ trình học TOÀN DIỆN, bằng cách đăng ký qua form hoặc
            liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.
          </p>
        </div>

        <div className="register-cta__form"><ConsultationForm /></div>
      </div>
    </section>
  );
}
