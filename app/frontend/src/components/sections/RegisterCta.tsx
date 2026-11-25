import { useState, type FormEvent } from "react";
import Button from "../ui/Button";
import { InputField, SelectField } from "../ui/FormField";
import { courses } from "../../data/courses";
import { sendConsultation } from "../../services/consultations";
import "./RegisterCta.css";

export default function RegisterCta() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [courseSlug, setCourseSlug] = useState(courses[0]?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const course = courses.find(item => item.slug === courseSlug);
    if (!course) { setError("Vui lòng chọn khóa học bạn quan tâm."); return; }
    setBusy(true); setError("");
    try {
      await sendConsultation({ submissionId, fullName: name.trim(), phone: phone.trim(), email: email.trim(), courseSlug, courseName: course.course_name });
      setSubmitted(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Chưa gửi được yêu cầu. Hãy thử lại."); }
    finally { setBusy(false); }
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
              <h3>Đã nhận yêu cầu tư vấn!</h3>
              <p>
                Cảm ơn bạn đã quan tâm. Thông tin của bạn đã được gửi tới trung tâm để liên hệ tư vấn.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setPhone("");
                  setEmail("");
                  setSubmissionId(crypto.randomUUID());
                }}
              >
                Gửi yêu cầu khác
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p>Thông tin được dùng để trung tâm liên hệ tư vấn khóa học bạn quan tâm.</p>
              {error && <p role="alert">{error}</p>}
              <fieldset disabled={busy} className="register-cta__fields" onChange={() => setSubmissionId(crypto.randomUUID())}>
              <InputField
                label="Họ và tên"
                id="register-name"
                required
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <InputField
                label="Số điện thoại"
                id="register-phone"
                type="tel"
                maxLength={30}
                minLength={8}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <InputField
                label="Email"
                id="register-email"
                type="email"
                maxLength={255}
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
              </fieldset>
              <Button type="submit" variant="primary" disabled={busy} className="register-cta__submit">
                {busy ? "Đang gửi…" : "Gửi đăng ký"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
