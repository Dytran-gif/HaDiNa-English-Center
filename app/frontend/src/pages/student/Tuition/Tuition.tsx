import { useState } from "react";
import "../General.css";
import "./Tuition.css";
import "../StudentExtra.css";
import { useStudentApi, useStudentBankInfo, useStudentTuition, type StudentTuitionItem } from "../../../services/student/useStudentApi";
import { useLang } from "../../../i18n/LanguageContext";
import PaymentHistory from "./Components/PaymentHistory";

// Học phí: học viên XEM phải đóng / đã đóng / còn nợ và BÁO đã chuyển khoản.
// Không tự tạo phiếu thu: yêu cầu chờ trung tâm đối soát và xác nhận (Admin > Học phí > Chờ xác nhận).
export default function StudentTuition() {
    const { data: items, reload } = useStudentTuition();
    const { data: bank } = useStudentBankInfo();
    const api = useStudentApi();
    const { t, money } = useLang();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [amount, setAmount] = useState("");
    const [transferRef, setTransferRef] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

    const owing = items.filter(i => i.enrollmentStatus !== "Dropped" && i.remainingAmount > 0);
    const selected: StudentTuitionItem | undefined = owing.find(i => i.enrollmentId === selectedId) ?? owing[0];
    const canRequest = selected ? Math.max(0, selected.remainingAmount - selected.pendingAmount) : 0;
    const totalRemaining = owing.reduce((s, i) => s + i.remainingAmount, 0);
    const totalPending = owing.reduce((s, i) => s + i.pendingAmount, 0);
    const transferContent = selected ? `${selected.classCode}` : "";

    async function submit() {
        if (!selected || busy) return;
        const value = Number(amount.replace(/\D/g, "")) || canRequest;
        setBusy(true); setMessage(null);
        try {
            const res = await api.send<{ message: string }>("POST", "tuition/transfer-requests", {
                enrollmentId: selected.enrollmentId, amount: value, transferRef: transferRef.trim() || null,
            });
            setMessage({ ok: true, text: res.message });
            setAmount(""); setTransferRef("");
            reload();
        } catch (err) {
            setMessage({ ok: false, text: err instanceof Error ? err.message : t("alerts.payFailed") });
        } finally { setBusy(false); }
    }

    return (
        <div className="container">
            <section className="tuition-hero">
                <div className="tuition-hero-icon">
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <div>
                    <h1>{t("tuition.title")}</h1>
                    <p>{t("sx.tuitionSub")}</p>
                </div>
            </section>

            <div className="row g-3">
                <div className="col-12">
                    <section className="sx-panel" style={{ display: "grid", gap: 16 }}>
                        <div className="sx-stats" style={{ marginTop: 0 }}>
                            <div className="sx-stat"><span>{t("sx.totalRemaining")}</span><b style={{ color: "#b42318" }}>{money(totalRemaining)}</b></div>
                            <div className="sx-stat"><span>{t("sx.totalPending")}</span><b style={{ color: "#a35b00" }}>{money(totalPending)}</b></div>
                            <div className="sx-stat"><span>{t("sx.classesOwing")}</span><b>{owing.length}</b></div>
                        </div>

                        {owing.length === 0 ? (
                            <div className="sx-empty">{t("sx.noDebt")}</div>
                        ) : (
                            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                                <div>
                                    <table className="sx-table">
                                        <thead>
                                            <tr><th></th><th>{t("sx.classCode")}</th><th className="is-money">{t("sx.mustPay")}</th><th className="is-money">{t("sx.remainingCol")}</th></tr>
                                        </thead>
                                        <tbody>
                                            {owing.map(i => (
                                                <tr key={i.enrollmentId} className="sx-clickable" onClick={() => setSelectedId(i.enrollmentId)}>
                                                    <td><input type="radio" name="tuition-item" aria-label={i.classCode}
                                                        checked={selected?.enrollmentId === i.enrollmentId} onChange={() => setSelectedId(i.enrollmentId)} /></td>
                                                    <td>
                                                        <span className="sx-code">{i.classCode}</span>
                                                        <div style={{ fontWeight: 700, marginTop: 4 }}>{i.courseName}</div>
                                                        <span className={`sx-chip is-${i.paymentStatus.toLowerCase()}`}>{t(`sx.pay.${i.paymentStatus}`)}</span>
                                                        {i.pendingAmount > 0 && <span className="sx-chip is-pending" style={{ marginLeft: 6 }}>{t("sx.pendingShort", { amount: money(i.pendingAmount) })}</span>}
                                                    </td>
                                                    <td className="is-money">
                                                        {money(i.finalTuitionFee)}
                                                        {i.discountAmount > 0 && <div className="sx-muted">{t("sx.discounted", { amount: money(i.discountAmount) })}</div>}
                                                        {i.discountNote && <div className="sx-muted">{i.discountNote}</div>}
                                                    </td>
                                                    <td className="is-money" style={{ color: "#b42318", fontWeight: 700 }}>{money(i.remainingAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {selected && (
                                    <div className="sx-card" style={{ borderTopColor: "#1e3a8a" }}>
                                        <h4>{t("sx.transferTitle")}</h4>
                                        <div className="sx-bank">
                                            <div className="sx-qr" aria-hidden="true" />
                                            <div className="sx-muted" style={{ lineHeight: 1.7 }}>
                                                {bank?.bankName} · <strong style={{ color: "#111827" }}>{bank?.accountNumber}</strong><br />
                                                {bank?.accountName}<br />
                                                {t("sx.transferContent")}: <strong style={{ color: "#111827" }}>{transferContent}</strong>
                                            </div>
                                        </div>
                                        <label className="sx-field">
                                            {t("sx.amount", { max: money(canRequest) })}
                                            <input inputMode="numeric" placeholder={canRequest.toLocaleString("vi-VN")}
                                                value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
                                        </label>
                                        <label className="sx-field">
                                            {t("sx.transferRef")}
                                            <input maxLength={100} value={transferRef} onChange={e => setTransferRef(e.target.value)} placeholder="VD: FT2633..." />
                                        </label>
                                        <button type="button" className="sx-btn is-primary is-block" disabled={busy || canRequest <= 0} onClick={submit}>
                                            <i className="fa-solid fa-paper-plane"></i> {busy ? t("sx.saving") : t("sx.iTransferred")}
                                        </button>
                                        {canRequest <= 0 && <p className="sx-muted">{t("sx.allPending")}</p>}
                                        {message && <p className={message.ok ? "sx-ok" : "sx-error"} role="status">{message.text}</p>}
                                        <p className="sx-muted">{t("sx.cashNote")}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                <div className="col-12">
                    <div className="tuition-section-head">
                        <h2>{t("payHistory.title")}</h2>
                        <p>{t("sx.historyPaySub")}</p>
                    </div>
                    <PaymentHistory items={items} />
                </div>
            </div>
        </div>
    );
}
