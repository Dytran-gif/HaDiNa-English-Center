import { useState, type FormEvent } from "react";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { InputField } from "../components/ui/FormField";
import "./Auth.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (fullName === "" || email === "" || password === "") {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    // Demo only — no backend yet, mirrors the flow described in docs/6.
    setError("");
    setSuccess(true);
  }

  return (
    <PageShell>
      <div className="auth-page container">
        <Card className="auth-card">
          <span className="kicker">Học viên</span>
          <h1>Đăng ký</h1>

          {success ? (
            <p className="auth-success">
              Đăng ký tài khoản thành công (demo). Vui lòng đăng nhập để bắt đầu.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <InputField
                label="Họ và tên"
                id="register-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <InputField
                label="Email"
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField
                label="Mật khẩu"
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputField
                label="Nhập lại mật khẩu"
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <p className="auth-error">{error}</p>}
              <Button type="submit" variant="primary">
                Đăng ký
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
