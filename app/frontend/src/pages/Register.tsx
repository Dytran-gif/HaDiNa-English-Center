import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { InputField } from "../components/ui/FormField";
import { registerStudent } from "../services/registerStudent";
import { ApiError } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

type Field = "fullName" | "email" | "phone" | "password" | "confirmPassword" | "dateOfBirth" | "parentName" | "parentPhone";
type Errors = Partial<Record<Field, string>>;

const digits = (value: string) => value.replace(/\D/g, "").length;

// Kiểm tra ngay ở trình duyệt (BE vẫn kiểm tra lại), lỗi hiện dưới từng ô
function validate(v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (v.fullName.trim().length < 2) e.fullName = "Nhập họ và tên.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Email chưa đúng định dạng.";
  if (digits(v.phone) < 8 || digits(v.phone) > 15) e.phone = "Số điện thoại cần 8–15 chữ số.";
  if (v.password.length < 8) e.password = "Mật khẩu tối thiểu 8 ký tự.";
  else if (new TextEncoder().encode(v.password).length > 72) e.password = "Mật khẩu quá dài.";
  if (v.confirmPassword !== v.password) e.confirmPassword = "Mật khẩu nhập lại không khớp.";
  if (v.dateOfBirth) {
    const dob = new Date(v.dateOfBirth);
    const age = (Date.now() - dob.getTime()) / (365.25 * 86400000);
    if (Number.isNaN(age) || age < 4 || age > 100) e.dateOfBirth = "Ngày sinh không hợp lệ.";
  }
  if (v.parentPhone && (digits(v.parentPhone) < 8 || digits(v.parentPhone) > 15)) e.parentPhone = "Số điện thoại cần 8–15 chữ số.";
  return e;
}

// Đăng ký học viên mới: tạo tài khoản -> tự đăng nhập -> sang trang chọn khóa & lớp trong cổng học viên.
export default function Register() {
  const navigate = useNavigate();
  const { loginApi } = useAuth();
  const [values, setValues] = useState<Record<Field, string>>({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "", dateOfBirth: "", parentName: "", parentPhone: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);

  const set = (field: Field) => (event: { target: { value: string } }) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };
  const blur = (field: Field) => () => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };
  const shown = (field: Field) => (touched[field] ? errors[field] : undefined);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const found = validate(values);
    setErrors(found);
    setTouched({ fullName: true, email: true, phone: true, password: true, confirmPassword: true, dateOfBirth: true, parentPhone: true });
    if (Object.keys(found).length) {
      setError("Vui lòng kiểm tra lại các ô được đánh dấu.");
      if (found.dateOfBirth || found.parentPhone) setShowMore(true);
      return;
    }
    setBusy(true); setError("");
    try {
      const result = await registerStudent({
        fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim(),
        password: values.password, confirmPassword: values.confirmPassword,
        dateOfBirth: values.dateOfBirth || null,
        parentName: values.parentName.trim() || null, parentPhone: values.parentPhone.trim() || null,
      });
      setDone({ code: result.code });
      // Đăng nhập luôn rồi chuyển sang bước 2: chọn khóa và lớp
      try {
        await loginApi(values.email.trim(), values.password);
        navigate("/student/courses?tab=browse", { replace: true });
      } catch {
        /* Không đăng nhập tự động được: vẫn hiện thông báo thành công + nút đăng nhập */
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không đăng ký được. Vui lòng thử lại.");
      if (reason instanceof ApiError) {
        const mapped: Errors = {};
        for (const [key, list] of Object.entries(reason.fieldErrors ?? {})) {
          const field = (key.charAt(0).toLowerCase() + key.slice(1)) as Field;
          mapped[field] = list.join(" ");
        }
        setErrors(mapped);
        setTouched(Object.fromEntries(Object.keys(mapped).map(k => [k, true])));
      }
    } finally { setBusy(false); }
  }

  return (
    <PageShell>
      <div className="auth-page container">
        <Card className="auth-card auth-card--wide">
          <span className="kicker">Học viên mới</span>
          <h1>Đăng ký học</h1>

          <ol className="auth-steps" aria-label="Các bước đăng ký">
            <li className="is-active"><b>1</b> Tài khoản</li>
            <li><b>2</b> Chọn lớp</li>
            <li><b>3</b> Học phí</li>
          </ol>

          {done ? (
            <div className="auth-success" role="status">
              <p>Tạo tài khoản thành công! Mã học viên của bạn: <strong>{done.code}</strong>.</p>
              <Button to="/dang-nhap" variant="primary">Đăng nhập để chọn lớp</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <fieldset className="auth-fields" disabled={busy}>
                <legend className="auth-legend">Thông tin tài khoản</legend>
                <InputField label="Họ và tên" id="register-name" autoComplete="name" maxLength={150}
                  value={values.fullName} onChange={set("fullName")} onBlur={blur("fullName")} error={shown("fullName")} />
                <div className="auth-grid">
                  <InputField label="Email" id="register-email" type="email" inputMode="email" autoComplete="email" maxLength={255}
                    value={values.email} onChange={set("email")} onBlur={blur("email")} error={shown("email")} />
                  <InputField label="Số điện thoại" id="register-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20}
                    value={values.phone} onChange={set("phone")} onBlur={blur("phone")} error={shown("phone")} />
                </div>
                <div className="auth-grid">
                  <InputField label="Mật khẩu" id="register-password" type="password" autoComplete="new-password" maxLength={72}
                    value={values.password} onChange={set("password")} onBlur={blur("password")}
                    error={shown("password")} aria-describedby="register-password-hint" />
                  <InputField label="Nhập lại mật khẩu" id="register-confirm-password" type="password" autoComplete="new-password" maxLength={72}
                    value={values.confirmPassword} onChange={set("confirmPassword")} onBlur={blur("confirmPassword")} error={shown("confirmPassword")} />
                </div>
                <p id="register-password-hint" className="auth-hint">Tối thiểu 8 ký tự.</p>
              </fieldset>

              <button type="button" className="auth-more" aria-expanded={showMore} onClick={() => setShowMore(v => !v)}>
                <span aria-hidden="true">{showMore ? "▴" : "▾"}</span> Thông tin thêm (không bắt buộc): ngày sinh, phụ huynh
              </button>
              {showMore && (
                <fieldset className="auth-fields" disabled={busy}>
                  <InputField label="Ngày sinh" id="register-dob" type="date"
                    value={values.dateOfBirth} onChange={set("dateOfBirth")} onBlur={blur("dateOfBirth")} error={shown("dateOfBirth")} />
                  <div className="auth-grid">
                    <InputField label="Họ tên phụ huynh" id="register-parent" maxLength={150}
                      value={values.parentName} onChange={set("parentName")} />
                    <InputField label="SĐT phụ huynh" id="register-parent-phone" type="tel" inputMode="tel" maxLength={20}
                      value={values.parentPhone} onChange={set("parentPhone")} onBlur={blur("parentPhone")} error={shown("parentPhone")} />
                  </div>
                </fieldset>
              )}

              <p className="auth-error" role="alert">{error}</p>
              <Button type="submit" variant="primary" disabled={busy} className="auth-submit">
                {busy ? "Đang tạo tài khoản…" : "Tạo tài khoản và chọn lớp"}
              </Button>
            </form>
          )}

          <p className="auth-switch">
            Đã có tài khoản? <Button to="/dang-nhap" variant="ghost">Đăng nhập</Button>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
