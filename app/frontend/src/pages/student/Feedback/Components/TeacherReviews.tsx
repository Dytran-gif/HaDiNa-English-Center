import { useState } from "react";
import { useStudentApi, useStudentReviews, type StudentReviewClass } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import "../../StudentExtra.css";

// Học viên đánh giá giáo viên của lớp mình đã học. Trung tâm duyệt rồi mới hiện ở trang public (kèm tên viết tắt).
export default function TeacherReviews() {
    const { t, date } = useLang();
    const api = useStudentApi();
    const { data, reload, loading } = useStudentReviews();
    const [editing, setEditing] = useState<StudentReviewClass | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

    const open = (c: StudentReviewClass) => {
        setEditing(c);
        setRating(c.review?.rating ?? 5);
        setComment(c.review?.comment ?? "");
        setMessage(null);
    };

    async function save() {
        if (!editing || busy) return;
        if (comment.trim().length < 10) { setMessage({ ok: false, text: t("sx.reviewTooShort") }); return; }
        setBusy(true); setMessage(null);
        try {
            const res = await api.send<{ message: string }>("POST", "reviews", { classId: editing.classId, rating, comment: comment.trim() });
            setMessage({ ok: true, text: res.message });
            reload();
            setEditing(null);
        } catch (err) {
            setMessage({ ok: false, text: err instanceof Error ? err.message : "Error" });
        } finally { setBusy(false); }
    }

    return (
        <section className="sx-panel" style={{ display: "grid", gap: 14 }}>
            <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}><i className="fa-solid fa-star" style={{ color: "#f59e0b" }}></i> {t("sx.reviewTitle")}</h3>
                <p className="sx-muted" style={{ margin: "4px 0 0" }}>{t("sx.reviewSub")}</p>
            </div>
            {message && !editing && <p className={message.ok ? "sx-ok" : "sx-error"}>{message.text}</p>}
            {loading ? <p className="sx-muted">{t("sx.loading")}</p> : (data ?? []).length === 0 ? (
                <div className="sx-empty">{t("sx.noReviewable")}</div>
            ) : (
                <div className="sx-grid">
                    {(data ?? []).map(c => (
                        <article key={c.classId} className="sx-card">
                            <div className="sx-card-head">
                                <span className="sx-code">{c.classCode}</span>
                                {c.review ? (
                                    <span className={`sx-chip ${c.review.isPublished ? "is-confirmed" : "is-pending"}`}>
                                        {c.review.isPublished ? t("sx.reviewPublished") : t("sx.reviewPending")}
                                    </span>
                                ) : <span className="sx-chip is-neutral">{t("sx.notReviewed")}</span>}
                            </div>
                            <h4>{c.teacherName}</h4>
                            <div className="sx-muted">{c.courseName} · {date(c.startDate)} → {date(c.endDate)}</div>
                            {c.review && (
                                <div>
                                    <span style={{ color: "#f59e0b" }}>{"★".repeat(c.review.rating)}</span>
                                    <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - c.review.rating)}</span>
                                    <p className="sx-muted" style={{ margin: "4px 0 0" }}>“{c.review.comment}”</p>
                                </div>
                            )}
                            <div className="sx-card-actions">
                                <button type="button" className="sx-btn" onClick={() => open(c)}>
                                    <i className="fa-regular fa-pen-to-square"></i> {c.review ? t("sx.editReview") : t("sx.writeReview")}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {editing && (
                <div className="sx-overlay" role="presentation" onClick={() => setEditing(null)}>
                    <div className="sx-modal" role="dialog" aria-modal="true" aria-labelledby="sx-review-title" onClick={e => e.stopPropagation()}>
                        <div className="sx-modal-head">
                            <div>
                                <span className="sx-code">{editing.classCode}</span>
                                <h3 id="sx-review-title">{t("sx.reviewFor", { name: editing.teacherName })}</h3>
                            </div>
                            <button type="button" className="sx-close" onClick={() => setEditing(null)} aria-label={t("sx.close")}>×</button>
                        </div>
                        <div className="sx-field">
                            {t("sx.rating")}
                            <div className="sx-stars" role="radiogroup" aria-label={t("sx.rating")}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n}/5`}
                                        className={n <= rating ? "is-on" : ""} onClick={() => setRating(n)}>★</button>
                                ))}
                            </div>
                        </div>
                        <label className="sx-field">
                            {t("sx.comment")}
                            <textarea rows={4} maxLength={1000} value={comment} onChange={e => setComment(e.target.value)} />
                        </label>
                        <p className="sx-muted">{t("sx.reviewNote")}</p>
                        {message && !message.ok && <p className="sx-error">{message.text}</p>}
                        <div className="sx-modal-foot">
                            <button type="button" className="sx-btn" onClick={() => setEditing(null)}>{t("sx.cancel")}</button>
                            <button type="button" className="sx-btn is-primary" disabled={busy} onClick={save}>{busy ? t("sx.saving") : t("sx.sendReview")}</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
