import { useState, type FormEvent } from "react";
import Button from "./Button";
import { InputField, SelectField } from "./FormField";
import usePublicCourses from "../../services/usePublicCourses";
import type { PublicCourse } from "../../services/usePublicCourse";
import { sendConsultation } from "../../services/consultations";
import "./ConsultationForm.css";

export default function ConsultationForm({ course, idPrefix = "register", onBusyChange }: { course?: PublicCourse; idPrefix?: string; onBusyChange?: (busy: boolean) => void }) {
  const catalog = usePublicCourses();
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [slug, setSlug] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false); const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const selected = course ?? catalog.courses.find(c => c.slug === slug);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    if (!name.trim()) { setError("Vui lòng nhập họ và tên."); return; }
    const digits = phone.replace(/\D/g, "").length;
    if (digits < 8 || digits > 15) { setError("Số điện thoại cần từ 8 đến 15 chữ số."); return; }
    if (!selected) { setError("Vui lòng chọn khóa học bạn quan tâm."); return; }
    setBusy(true); onBusyChange?.(true); setError("");
    try {
      await sendConsultation({ submissionId, fullName: name.trim(), phone: phone.trim(), email: email.trim(), courseSlug: selected.slug, courseName: selected.course_name });
      setSubmitted(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Chưa gửi được yêu cầu. Vui lòng thử lại."); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  if (submitted) return <div className="consultation-form__success" role="status"><h3>Đã gửi đăng ký!</h3><p>Trung tâm đã nhận thông tin và sẽ liên hệ tư vấn khóa học cho bạn.</p><Button type="button" variant="outline" onClick={() => { setSubmitted(false); setName(""); setPhone(""); setEmail(""); setSubmissionId(crypto.randomUUID()); }}>Gửi yêu cầu khác</Button></div>;
  return <form className="consultation-form" onSubmit={submit}>
    <p>Để lại thông tin để trung tâm liên hệ tư vấn và hỗ trợ đăng ký. Không cần tạo tài khoản.</p>
    {error && <p role="alert">{error}</p>}
    {!course && catalog.error && <div role="alert"><p>{catalog.error}</p><Button type="button" variant="outline" onClick={() => void catalog.reload()}>Tải lại khóa học</Button></div>}
    <fieldset className="consultation-form__fields" disabled={busy} onChange={() => setSubmissionId(crypto.randomUUID())}>
      <InputField label="Họ và tên" id={`${idPrefix}-name`} autoComplete="name" required maxLength={150} value={name} onChange={e => setName(e.target.value)} />
      <InputField label="Số điện thoại" id={`${idPrefix}-phone`} autoComplete="tel" type="tel" required minLength={8} maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} />
      <InputField label="Email" id={`${idPrefix}-email`} autoComplete="email" type="email" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} />
      {course ? <InputField label="Khóa học đăng ký" id={`${idPrefix}-course`} value={course.course_name} readOnly />
        : <SelectField label="Quan tâm khoá học" id={`${idPrefix}-course`} required disabled={catalog.loading || !!catalog.error || !catalog.courses.length} value={slug} onChange={e => setSlug(e.target.value)} options={[{ value: "", label: catalog.loading ? "Đang tải khóa học…" : "Chọn khóa học" }, ...catalog.courses.map(c => ({ value: c.slug, label: c.course_name }))]} />}
    </fieldset>
    <Button type="submit" variant="primary" disabled={busy || !selected || (!course && (catalog.loading || !!catalog.error))}>{busy ? "Đang gửi…" : "Gửi đăng ký"}</Button>
  </form>;
}
