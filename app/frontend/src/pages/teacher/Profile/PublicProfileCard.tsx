import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { errorMessage, useTeacherApi, useTeacherQuery } from "../../../services/teacher/teacherApi";
import type { TeacherPublicProfile, TeacherReviewList } from "../../../types/teacherApi";
import { Empty, Notice, QueryState } from "../Components/Common/Feedback";
import { fmtDate } from "../Components/Common/format";

// Hồ sơ hiển thị trên trang /giao-vien của website: giáo viên tự viết giới thiệu, bằng cấp và bật/tắt hiển thị.
// Tên, ảnh lấy từ tài khoản; "Khóa phụ trách" tự lấy từ các lớp thật -> trang public luôn khớp với cổng Giáo viên.
export function PublicProfileCard() {
  const api = useTeacherApi();
  const { data, loading, error, reload } = useTeacherQuery<TeacherPublicProfile>("profile/public");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [credentials, setCredentials] = useState("");
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "error" }>({ text: "", tone: "ok" });

  useEffect(() => {
    if (!data) return;
    setTitle(data.title ?? "");
    setBio(data.bio ?? "");
    setCredentials((data.credentials ?? []).join("\n"));
    setPublished(data.isPublished);
  }, [data]);

  async function save() {
    setBusy(true);
    try {
      const r = await api.send<{ message: string }>("PUT", "profile/public", {
        title: title.trim(), bio: bio.trim(), isPublished: published,
        credentials: credentials.split("\n").map(x => x.trim()).filter(Boolean),
      });
      setNotice({ text: r.message, tone: "ok" });
      reload();
    } catch (e) { setNotice({ text: errorMessage(e), tone: "error" }); }
    finally { setBusy(false); }
  }

  return (
    <Card>
      <div className="t-row t-row--between">
        <h3 className="t-card-title" style={{ margin: 0 }}>Hồ sơ trên website</h3>
        {data?.exists && data.isPublished && data.slug && (
          <a className="t-link t-small" href={`/giao-vien/${data.slug}`} target="_blank" rel="noreferrer">Xem trang công khai ↗</a>
        )}
      </div>
      <Notice message={notice.text} tone={notice.tone} onClose={() => setNotice({ text: "", tone: "ok" })} />
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="t-form">
            <label className="t-label">Chức danh / chuyên môn hiển thị
              <input className="t-input" maxLength={300} value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: IELTS 8.5 · Thạc sĩ TESOL" />
            </label>
            <label className="t-label">Giới thiệu ({bio.trim().length}/4000, tối thiểu 20 ký tự)
              <textarea className="t-input" rows={5} maxLength={4000} value={bio} onChange={e => setBio(e.target.value)} />
            </label>
            <label className="t-label">Bằng cấp & chứng chỉ (mỗi dòng một mục)
              <textarea className="t-input" rows={3} value={credentials} onChange={e => setCredentials(e.target.value)} />
            </label>
            <p className="t-muted t-small">Khóa phụ trách hiển thị: {data.courses.length ? data.courses.join(", ") : "chưa có lớp"} (tự lấy từ lớp bạn dạy).</p>
            <label className="t-row t-small" style={{ gap: 8 }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
              Hiển thị trên trang Giáo viên của website
            </label>
            <div className="t-actions">
              <Button disabled={busy || title.trim().length === 0 || bio.trim().length < 20} onClick={save}>{busy ? "Đang lưu..." : "Lưu hồ sơ"}</Button>
            </div>
          </div>
        )}
      </QueryState>
    </Card>
  );
}

// Đánh giá của học viên về mình (đã duyệt + chờ duyệt). Tên học viên hiển thị dạng viết tắt.
export function MyReviewsCard() {
  const { data, loading, error, reload } = useTeacherQuery<TeacherReviewList>("reviews");
  return (
    <Card>
      <h3 className="t-card-title">Học viên đánh giá</h3>
      <QueryState loading={loading} error={error} onRetry={reload}>
        {data && (data.count === 0 ? <Empty>Chưa có đánh giá nào.</Empty> : (
          <>
            <p style={{ margin: "0 0 10px" }}><strong style={{ color: "#f59e0b" }}>★ {data.average.toFixed(1)}</strong> <span className="t-muted">· {data.count} đánh giá</span></p>
            <ul className="t-list">
              {data.items.map(r => (
                <li key={r.id}>
                  <div>
                    <strong>{r.studentName}</strong> <span className="t-muted t-small">· lớp <span className="t-code">{r.className}</span> · {fmtDate(r.createdAt)}</span>
                    <div><span style={{ color: "#f59e0b" }}>{"★".repeat(r.rating)}</span><span style={{ color: "#d1d5db" }}>{"★".repeat(5 - r.rating)}</span></div>
                    <div className="t-muted t-small t-pre">{r.comment}</div>
                  </div>
                  <span className="t-muted t-small">{r.isPublished ? "Đang hiển thị" : "Chờ Admin duyệt"}</span>
                </li>
              ))}
            </ul>
          </>
        ))}
      </QueryState>
    </Card>
  );
}
