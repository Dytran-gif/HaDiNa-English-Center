import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../../../types/StudentTypes/MainTypes";
import { useStudentApi, useStudentCourseClasses, type StudentClassOption } from "../../../../services/student/useStudentApi";
import { useLang } from "../../../../i18n/LanguageContext";
import "../../StudentExtra.css";

const DAY = ["", "T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function scheduleText(c: StudentClassOption) {
    const groups = new Map<string, number[]>();
    for (const s of c.schedules) {
        const key = `${s.startTime}–${s.endTime}${s.roomName ? ` · ${s.roomName}` : ""}`;
        groups.set(key, [...(groups.get(key) ?? []), s.dayOfWeek]);
    }
    return [...groups.entries()].map(([time, days]) => `${days.map(d => DAY[d]).join(", ")} ${time}`).join(" | ");
}

// Đăng ký khóa theo 3 bước: (1) khóa đã chọn -> (2) chọn lớp (sĩ số, trùng lịch) -> (3) xác nhận học phí.
// BE kiểm tra lại mọi luật khi xác nhận (POST api/student/enrollments).
export default function ClassPicker({ course, onClose, onDone }: { course: Course; onClose: () => void; onDone: () => void }) {
    const { t, money, date } = useLang();
    const navigate = useNavigate();
    const api = useStudentApi();
    const { data: classes, loading, error } = useStudentCourseClasses(course.id);
    const [selected, setSelected] = useState<StudentClassOption | null>(null);
    const [step, setStep] = useState<2 | 3 | 4>(2);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    async function confirm() {
        if (!selected || busy) return;
        setBusy(true); setMessage("");
        try {
            await api.send("POST", "enrollments", { classId: selected.id });
            setStep(4);
            onDone();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : t("alerts.registerFailed"));
        } finally { setBusy(false); }
    }

    return (
        <div className="sx-overlay" role="presentation" onClick={onClose}>
            <div className="sx-modal is-wide" role="dialog" aria-modal="true" aria-labelledby="sx-picker-title" onClick={e => e.stopPropagation()}>
                <div className="sx-modal-head">
                    <div>
                        <span className="sx-muted">{t("sx.registerTitle")}</span>
                        <h3 id="sx-picker-title">{course.name}</h3>
                    </div>
                    <button type="button" className="sx-close" onClick={onClose} aria-label={t("sx.close")}>×</button>
                </div>

                <ol className="sx-steps" aria-label={t("sx.steps")}>
                    <li className="sx-step is-done"><b>✓</b>{t("sx.step1")}</li>
                    <li className={`sx-step ${step === 2 ? "is-active" : "is-done"}`}><b>{step > 2 ? "✓" : 2}</b>{t("sx.step2")}</li>
                    <li className={`sx-step ${step === 3 ? "is-active" : step > 3 ? "is-done" : ""}`}><b>{step > 3 ? "✓" : 3}</b>{t("sx.step3")}</li>
                </ol>

                {step === 2 && (
                    <>
                        {loading && <p className="sx-muted">{t("sx.loading")}</p>}
                        {error && <p className="sx-error">{error}</p>}
                        {!loading && !error && (classes ?? []).length === 0 && <div className="sx-empty">{t("sx.noClasses")}</div>}
                        {(classes ?? []).map(c => (
                            <button
                                key={c.id}
                                type="button"
                                className="sx-class"
                                aria-pressed={selected?.id === c.id}
                                disabled={!c.canEnroll}
                                onClick={() => setSelected(c)}
                            >
                                <div>
                                    <strong>{c.name}</strong>
                                    <span className="sx-muted">{t("common.teacher")} {c.teacherName}</span>
                                </div>
                                <div className="sx-muted">
                                    {scheduleText(c)}<br />
                                    {date(c.startDate)} → {date(c.endDate)}
                                    {c.status === "Ongoing" && <> · {t("sx.remainingSessions", { n: c.remainingSessions, total: c.totalSessions })}</>}
                                </div>
                                <div className="sx-muted">
                                    {t("sx.seats", { a: c.enrolled, b: c.maxStudents })}
                                    <div className="sx-progress"><i style={{ width: `${Math.min(100, Math.round(100 * c.enrolled / Math.max(1, c.maxStudents)))}%`, background: c.isFull ? "#b42318" : undefined }} /></div>
                                </div>
                                <div className="sx-class-reason">
                                    {c.canEnroll
                                        ? <span className="sx-chip is-ongoing">✓ {t("sx.noConflict")}</span>
                                        : <span className={`sx-chip ${c.isFull ? "is-neutral" : "is-danger"}`}>✕ {c.reason}</span>}
                                </div>
                            </button>
                        ))}
                        <div className="sx-modal-foot">
                            <button type="button" className="sx-btn" onClick={onClose}>{t("sx.cancel")}</button>
                            <button type="button" className="sx-btn is-primary" disabled={!selected} onClick={() => setStep(3)}>
                                {t("sx.next")} →
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && selected && (
                    <>
                        <dl className="sx-dl">
                            <dt>{t("sx.className")}</dt><dd>{selected.name}</dd>
                            <dt>{t("sx.teacher")}</dt><dd>{selected.teacherName}</dd>
                            <dt>{t("sx.schedule")}</dt><dd>{scheduleText(selected)}</dd>
                            <dt>{t("sx.period")}</dt><dd>{date(selected.startDate)} → {date(selected.endDate)}</dd>
                        </dl>
                        <div className="sx-summary">
                            <div><span>{t("sx.courseFee")}</span><span>{money(course.tuition)}</span></div>
                            {course.discountPercent > 0 && <div><span>{t("sx.discount", { p: course.discountPercent })}</span><span>−{money(course.tuition - selected.finalTuition)}</span></div>}
                            <div className="is-total"><span>{t("sx.mustPay")}</span><span>{money(selected.finalTuition)}</span></div>
                        </div>
                        <p className="sx-muted" style={{ marginTop: 10 }}>{t("sx.payNote")}</p>
                        {message && <p className="sx-error" role="alert">{message}</p>}
                        <div className="sx-modal-foot">
                            <button type="button" className="sx-btn" onClick={() => setStep(2)} disabled={busy}>← {t("sx.back")}</button>
                            <button type="button" className="sx-btn is-primary" onClick={confirm} disabled={busy}>
                                {busy ? t("sx.saving") : t("sx.confirm")}
                            </button>
                        </div>
                    </>
                )}

                {step === 4 && selected && (
                    <>
                        <p className="sx-ok" role="status">{t("sx.registered", { code: selected.name })}</p>
                        <div className="sx-modal-foot">
                            <button type="button" className="sx-btn" onClick={onClose}>{t("sx.close")}</button>
                            <button type="button" className="sx-btn is-primary" onClick={() => navigate("/student/tuition")}>
                                <i className="fa-solid fa-wallet"></i> {t("sx.goPay")}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
