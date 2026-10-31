import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { InputField } from "../components/ui/FormField";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);

  const { login, loginApi } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (email === "" || password === "") {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setBusy(true); setError("");
    try {
      const user = demo ? login(email, password) : await loginApi(email, password);
      if (!user) { setError("Sai email hoặc mật khẩu demo."); return; }
      navigate(`/${user.role}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không đăng nhập được."); }
    finally { setBusy(false); }
  }

  return (
    <PageShell>
      <div className="auth-page container">
        <Card className="auth-card">
          <span className="kicker">HaDiNa English Center</span>
          <h1>Đăng nhập</h1>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email"
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              label="Mật khẩu"
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="field"><span><input type="checkbox" checked={demo} disabled={busy} onChange={e => setDemo(e.target.checked)} /> Xem giao diện bằng tài khoản demo (không cần máy chủ)</span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <Button to="/dang-ky" variant="ghost">Đăng ký</Button>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
