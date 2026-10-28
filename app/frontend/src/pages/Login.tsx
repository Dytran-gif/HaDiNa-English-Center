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

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (email === "" || password === "") {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    const user = login(email, password);
    if (!user) {
      setError("Sai email hoặc mật khẩu.");
      return;
    }

    setError("");
    navigate(`/${user.role}`); // student → /student, teacher → /teacher, admin → /admin
  }

  return (
    <PageShell>
      <div className="auth-page container">
        <Card className="auth-card">
          <span className="kicker">Học viên</span>
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
            {error && <p className="auth-error">{error}</p>}
            <Button type="submit" variant="primary">
              Đăng nhập
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