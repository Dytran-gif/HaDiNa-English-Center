import { useState, type FormEvent } from "react";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { InputField } from "../components/ui/FormField";
import { registerStudent } from "../services/registerStudent";
import { ApiError } from "../services/apiClient";
import "./Auth.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const fieldError = (name: string) => fields[name]?.join(" ") ?? fields[name.charAt(0).toUpperCase() + name.slice(1)]?.join(" ");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(""); setFields({});

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setError("Mật khẩu tối thiểu 8 ký tự, tối đa 72 byte UTF-8."); return;
    }
    setBusy(true);
    try {
      const result = await registerStudent({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password, confirmPassword });
      setCode(result.code); setPassword(""); setConfirmPassword(""); setSuccess(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không đăng ký được. Vui lòng thử lại.");
      if (reason instanceof ApiError) setFields(reason.fieldErrors);
    } finally { setBusy(false); }
  }

  return (
    <PageShell>
      <div className="auth-page container">
        <Card className="auth-card">
          <span className="kicker">Học viên</span>
          <h1>Đăng ký</h1>

          {success ? (
            <p className="auth-success" role="status">
              Đăng ký tài khoản thành công! Mã học viên: {code}. Vui lòng đăng nhập để bắt đầu.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p>Tạo tài khoản học viên để theo dõi việc học. Đăng ký tài khoản chưa bao gồm ghi danh vào lớp.</p>
              <fieldset className="auth-fields" disabled={busy}>
              <InputField
                label="Họ và tên"
                id="register-name"
                autoComplete="name"
                required maxLength={150} error={fieldError("fullName")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <InputField
                label="Email"
                id="register-email"
                type="email"
                autoComplete="email"
                required maxLength={255} error={fieldError("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField label="Số điện thoại" id="register-phone" type="tel" autoComplete="tel" required minLength={8} maxLength={20} value={phone} error={fieldError("phone")} onChange={event => setPhone(event.target.value)}/>
              <InputField
                label="Mật khẩu"
                id="register-password"
                autoComplete="new-password"
                required minLength={8} maxLength={72} error={fieldError("password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputField
                label="Nhập lại mật khẩu"
                id="register-confirm-password"
                autoComplete="new-password"
                required minLength={8} maxLength={72} error={fieldError("confirmPassword")}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              </fieldset>
              <p>Mật khẩu tối thiểu 8 ký tự.</p>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? "Đang tạo tài khoản…" : "Đăng ký"}
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
