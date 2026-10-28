import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import "./NotFound.css";

export default function NotFound() {
  return (
    <PageShell>
      <div className="not-found container">
        <span className="not-found__code">404</span>
        <h1>Không tìm thấy trang</h1>
        <p>Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
        <Button to="/" variant="primary">
          Về trang chủ
        </Button>
      </div>
    </PageShell>
  );
}
