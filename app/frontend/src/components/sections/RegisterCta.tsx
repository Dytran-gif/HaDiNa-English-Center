import { useState, type FormEvent } from "react";
import Button from "../ui/Button";
import { InputField, SelectField } from "../ui/FormField";
import { courses } from "../../data/courses";
import "./RegisterCta.css";

export default function RegisterCta() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [courseSlug, setCourseSlug] = useState(courses[0]?.slug ?? "");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Demo only — no backend yet, mirrors the flow described in docs/6.
    setSubmitted(true);
  }

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

        <div className="register-cta__form">
          {submitted ? (
            <div className="register-cta__success">
              <h3>Thông tin chưa được gửi</h3>
              <p>
                Form tư vấn hiện chưa kết nối máy chủ. Chưa có yêu cầu nào được lưu;
                bạn có thể xem thêm thông tin tại trang Liên hệ.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setPhone("");
                  setEmail("");
                }}
              >
                Quay lại biểu mẫu
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p role="note">Biểu mẫu đang trong quá trình hoàn thiện, chưa gửi thông tin tới trung tâm.</p>
              <InputField
                label="Họ và tên"
                id="register-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <InputField
                label="Số điện thoại"
                id="register-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <InputField
                label="Email"
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SelectField
                label="Quan tâm khoá học"
                id="register-course"
                value={courseSlug}
                onChange={(e) => setCourseSlug(e.target.value)}
                options={courses.map((c) => ({
                  value: c.slug,
                  label: c.course_name,
                }))}
              />
              <Button type="submit" variant="primary" className="register-cta__submit">
                Gửi đăng ký
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
