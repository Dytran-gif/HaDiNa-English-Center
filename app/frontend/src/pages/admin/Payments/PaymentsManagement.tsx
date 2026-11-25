import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../Components/Ui/Button";
import Modal from "../Components/Ui/Modal";
import Badge from "../Components/Ui/Badge";
import EmptyState from "../Components/Ui/EmptyState";
import Notice from "../Components/Ui/Notice";
import TableSkeleton from "../Components/Ui/TableSkeleton";
import { InputField, SelectField, TextareaField } from "../Components/Ui/FormField";
import useToast from "../Components/Ui/useToast";
import { assetUrl } from "../../../services/apiClient";
import { useAdminApi, useAdminQuery } from "../../../services/admin/useAdminApi";
import type { AdminRecord, PagedResponse, PaymentResponse, PaymentSummaryResponse, ReceiptResponse, ReceivableResponse, StudentResponse } from "../../../types/adminApi";
import { Pager } from "../Components/Api/AdminUi";
import { display, money } from "../Components/Api/adminFormat";
import SearchField from "../Components/Api/SearchField";
import "../admin-shared.css";
import "../Components/Api/AdminApi.css";

// Học phí: phiếu thu nhiều đợt, yêu cầu chuyển khoản của học viên chờ xác nhận, công nợ, hủy phiếu, hoàn tiền.
// Doanh thu chỉ tính phiếu đã xác nhận (Confirmed) trừ phiếu hoàn. Phiếu đã xác nhận không xóa, chỉ hủy kèm lý do.

type Tab = "pending" | "receivables" | "receipts";
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const statusTone = { Pending: "warning", Confirmed: "success", Rejected: "error", Cancelled: "neutral" } as const;
const statusLabel = { Pending: "Chờ xác nhận", Confirmed: "Đã xác nhận", Rejected: "Đã từ chối", Cancelled: "Đã hủy" } as const;
const payTone = { Unpaid: "error", Partial: "warning", Paid: "success", Refunded: "neutral" } as const;
const payLabel = { Unpaid: "Chưa đóng", Partial: "Đóng một phần", Paid: "Đã đóng đủ", Refunded: "Đã hoàn" } as const;
const parseMoney = (value: string) => Number(value.replace(/\D/g, "")) || 0;

// ---------- Lập phiếu thu (thu đủ hoặc một đợt) ----------
function PaymentForm({ studentId, busy, onBusyChange, saved }: { studentId: number; busy: boolean; onBusyChange: (value: boolean) => void; saved: () => void }) {
  const student = useAdminQuery<StudentResponse>(`students/${studentId}`);
  const api = useAdminApi();
  const [enrollmentId, setEnrollmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [paidDate, setPaidDate] = useState("");
  const [transferRef, setTransferRef] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const eligible = (student.data?.enrollments ?? []).filter(item => item.status === "Active" && item.remainingAmount > 0);
  const selected = eligible.find(item => item.id === Number(enrollmentId));
  const value = amount ? parseMoney(amount) : selected?.remainingAmount ?? 0;
  const tooMuch = !!selected && value > selected.remainingAmount;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !confirmed || busy || tooMuch || value <= 0) return;
    onBusyChange(true); setError("");
    try {
      await api.send("POST", "payments", { enrollmentId: selected.id, amount: value, method, paidDate: paidDate || null, transferRef: transferRef || null, note: note || null });
      saved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không lập được phiếu."); }
    finally { onBusyChange(false); }
  }

  return (
    <form className="admin-api-stack" onSubmit={submit}>
      {error && <Notice tone="error">{error}</Notice>}
      {student.error && <Notice tone="error" action={<Button onClick={student.reload}>Thử lại</Button>}>{student.error}</Notice>}
      {student.loading && <p role="status">Đang tải các khoản còn nợ…</p>}
      <fieldset className="admin-api-fieldset admin-api-stack" disabled={busy || student.loading || Boolean(student.error)}>
        <SelectField label="Ghi danh còn nợ" required value={enrollmentId}
          onChange={event => { setEnrollmentId(event.target.value); setAmount(""); setConfirmed(false); }}
          options={[{ value: "", label: "Chọn lớp" }, ...eligible.map(item => ({ value: String(item.id), label: `${item.classCode} · ${item.courseName} · còn ${money(item.remainingAmount)}` }))]} />
        {student.data && !eligible.length && <Notice tone="info">Học viên không còn khoản nợ nào.</Notice>}
        {selected && (
          <div className="admin-api-schedule">
            <dl className="admin-management-fields">
              <div><dt>Phải thu</dt><dd>{money(selected.finalTuitionFee)}</dd></div>
              <div><dt>Đã thu</dt><dd>{money(selected.paidAmount - selected.refundedAmount)}</dd></div>
              <div><dt>Còn nợ</dt><dd><strong className="admin-course-price">{money(selected.remainingAmount)}</strong></dd></div>
              {selected.pendingAmount > 0 && <div><dt>Học viên báo đã CK</dt><dd>{money(selected.pendingAmount)} (đang chờ xác nhận)</dd></div>}
            </dl>
          </div>
        )}
        <InputField label="Số tiền thu đợt này" inputMode="numeric" placeholder={selected ? selected.remainingAmount.toLocaleString("vi-VN") : ""}
          help="Để trống = thu đủ số còn nợ. Có thể thu nhiều đợt." value={amount}
          error={tooMuch ? `Không vượt số còn nợ ${money(selected!.remainingAmount)}` : undefined}
          onChange={event => setAmount(event.target.value.replace(/[^\d.]/g, ""))} />
        <SelectField label="Hình thức thanh toán" value={method} onChange={event => setMethod(event.target.value)}
          options={[{ value: "Cash", label: "Tiền mặt" }, { value: "Transfer", label: "Chuyển khoản" }]} />
        {method === "Transfer" && <InputField label="Mã giao dịch" maxLength={100} value={transferRef} onChange={event => setTransferRef(event.target.value)} />}
        <InputField label="Ngày thu" type="date" max={today()} help="Để trống để lấy hôm nay. Doanh thu tính theo ngày lập/xác nhận phiếu." value={paidDate} onChange={event => setPaidDate(event.target.value)} />
        <TextareaField label="Ghi chú" maxLength={500} value={note} onChange={event => setNote(event.target.value)} />
        <label><input type="checkbox" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> Tôi xác nhận đã nhận {selected ? money(value) : "số tiền"}.</label>
        <Button type="submit" variant="primary" loading={busy} disabled={!selected || !confirmed || tooMuch || value <= 0}>Lập phiếu thu</Button>
      </fieldset>
    </form>
  );
}

function CreatePayment({ close, saved, studentId: initialStudent }: { close: () => void; saved: () => void; studentId?: number }) {
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState(initialStudent ? String(initialStudent) : "");
  const [busy, setBusy] = useState(false);
  const students = useAdminQuery<PagedResponse<AdminRecord>>(`students?pageSize=100&search=${encodeURIComponent(search)}`);
  return (
    <Modal open busy={busy} title="Lập phiếu thu" onClose={close} footer={<Button disabled={busy} onClick={close}>Đóng</Button>}>
      <div className="admin-api-stack">
        <SearchField label="Tìm học viên" placeholder="Nhập tên, mã hoặc số điện thoại…" disabled={busy} value={search} onSearch={value => { setSearch(value); setStudentId(""); }} />
        {students.error && <Notice tone="error" action={<Button onClick={students.reload}>Thử lại</Button>}>{students.error}</Notice>}
        <SelectField label="Học viên" disabled={busy || students.loading || Boolean(students.error)} value={studentId} onChange={event => setStudentId(event.target.value)}
          options={[{ value: "", label: students.loading ? "Đang tìm học viên…" : "Chọn học viên" }, ...(students.data?.items ?? []).map(item => ({ value: String(item.id), label: `${item.code} · ${item.fullName}` }))]} />
        {studentId && <PaymentForm key={studentId} studentId={Number(studentId)} busy={busy} onBusyChange={setBusy} saved={() => { saved(); close(); }} />}
      </div>
    </Modal>
  );
}

// ---------- Biên lai ----------
function Receipt({ id, close }: { id: number; close: () => void }) {
  const query = useAdminQuery<ReceiptResponse>(`payments/${id}`);
  const data = query.data;
  const p = data?.payment;
  return (
    <Modal open title={p?.kind === "Refund" ? "Phiếu hoàn tiền" : "Biên lai học phí"} className="admin-receipt-dialog" onClose={close}
      footer={<><Button onClick={close}>Đóng</Button><Button variant="primary" disabled={!data || p?.status !== "Confirmed"} onClick={() => window.print()}>In biên lai</Button></>}>
      {query.error && <Notice tone="error" action={<Button onClick={query.reload}>Thử lại</Button>}>{query.error}</Notice>}
      {query.loading && <p role="status">Đang tải biên lai…</p>}
      {data && p && (
        <article className="admin-api-receipt">
          {assetUrl(data.center.logoUrl) && <img className="admin-api-logo" src={assetUrl(data.center.logoUrl)} alt="Logo trung tâm" />}
          <h2>{data.center.name}</h2>
          <p>{data.center.address} · {data.center.phone}</p>
          <h3>{p.kind === "Refund" ? "PHIẾU HOÀN TIỀN" : "BIÊN LAI THU HỌC PHÍ"} {p.receiptNo ?? `#${p.id}`}</h3>
          {p.status !== "Confirmed" && <Notice tone="warning">Phiếu {statusLabel[p.status].toLowerCase()}{p.cancelReason ? `: ${p.cancelReason}` : ""}</Notice>}
          <dl className="admin-management-fields">
            <div><dt>Học viên</dt><dd>{p.studentCode} · {p.studentName}</dd></div>
            <div><dt>Lớp / Khóa</dt><dd>{p.classCode} · {p.courseName}</dd></div>
            <div><dt>Học phí phải đóng</dt><dd>{money(p.finalTuitionFee)}</dd></div>
            <div><dt>{p.kind === "Refund" ? "Số tiền hoàn" : "Số tiền thu"}</dt><dd><strong>{money(p.amount)}</strong></dd></div>
            <div><dt>Ngày / Hình thức</dt><dd>{display(p.paidDate)} · {p.method === "Transfer" ? "Chuyển khoản" : "Tiền mặt"}{p.transferRef ? ` · ${p.transferRef}` : ""}</dd></div>
            <div><dt>Người xác nhận</dt><dd>{data.createdByName}</dd></div>
            <div><dt>Ghi chú</dt><dd>{data.note || "—"}</dd></div>
          </dl>
        </article>
      )}
    </Modal>
  );
}

// ---------- Hộp nhập lý do (từ chối / hủy) và hoàn tiền ----------
function ReasonDialog({ title, label, confirmText, onClose, onSubmit }: { title: string; label: string; confirmText: string; onClose: () => void; onSubmit: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    if (reason.trim().length < 3) { setError("Nhập lý do (tối thiểu 3 ký tự)."); return; }
    setBusy(true); setError("");
    try { await onSubmit(reason.trim()); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thực hiện được."); }
    finally { setBusy(false); }
  }
  return (
    <Modal open busy={busy} title={title} onClose={onClose}
      footer={<><Button disabled={busy} onClick={onClose}>Hủy</Button><Button variant="danger" loading={busy} onClick={submit}>{confirmText}</Button></>}>
      {error && <Notice tone="error">{error}</Notice>}
      <TextareaField label={label} maxLength={300} value={reason} onChange={e => setReason(e.target.value)} />
    </Modal>
  );
}

function RefundDialog({ row, onClose, saved }: { row: ReceivableResponse; onClose: () => void; saved: () => void }) {
  const api = useAdminApi();
  const net = row.paidAmount - row.refundedAmount;
  const [amount, setAmount] = useState(String(net));
  const [method, setMethod] = useState("Cash");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const value = parseMoney(amount);
  async function submit() {
    if (value <= 0 || value > net) { setError(`Số hoàn từ 1 đến ${money(net)}.`); return; }
    if (reason.trim().length < 3) { setError("Nhập lý do hoàn tiền."); return; }
    setBusy(true); setError("");
    try { await api.send("POST", "payments/refunds", { enrollmentId: row.enrollmentId, amount: value, method, reason: reason.trim() }); saved(); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "Không lập được phiếu hoàn."); }
    finally { setBusy(false); }
  }
  return (
    <Modal open busy={busy} title={`Hoàn tiền · ${row.studentCode} · ${row.classCode}`} onClose={onClose}
      footer={<><Button disabled={busy} onClick={onClose}>Hủy</Button><Button variant="primary" loading={busy} onClick={submit}>Lập phiếu hoàn</Button></>}>
      <div className="admin-api-stack">
        {error && <Notice tone="error">{error}</Notice>}
        <p className="admin-api-muted">Đã thu thực: {money(net)}. Phiếu hoàn trừ vào doanh thu ngày lập.</p>
        <InputField label="Số tiền hoàn" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
        <SelectField label="Hình thức" value={method} onChange={e => setMethod(e.target.value)} options={[{ value: "Cash", label: "Tiền mặt" }, { value: "Transfer", label: "Chuyển khoản" }]} />
        <TextareaField label="Lý do (vd: nghỉ học sau 3 buổi, hoàn 70%)" maxLength={300} value={reason} onChange={e => setReason(e.target.value)} />
      </div>
    </Modal>
  );
}

// ---------- Trang ----------
export default function PaymentsManagement() {
  const [params, setParams] = useSearchParams();
  const { notify } = useToast();
  const api = useAdminApi();
  const tab: Tab = (params.get("tab") as Tab) || "pending";
  const rawPage = Number(params.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const search = params.get("search") ?? "";
  const from = params.get("from") ?? "", to = params.get("to") ?? "", method = params.get("method") ?? "", status = params.get("status") ?? "";
  const invalidRange = Boolean(from && to && from > to);

  const summary = useAdminQuery<PaymentSummaryResponse>("payments/summary");
  const q = new URLSearchParams({ page: String(page), pageSize: "10", search });
  if (tab === "pending") q.set("status", "Pending");
  if (tab === "receipts") { if (status) q.set("status", status); if (method) q.set("method", method); if (from) q.set("from", from); if (to) q.set("to", to); }
  const payments = useAdminQuery<PagedResponse<PaymentResponse>>(`payments?${q}`);
  const receivables = useAdminQuery<PagedResponse<ReceivableResponse>>(`payments/receivables?page=${page}&pageSize=10&search=${encodeURIComponent(search)}`);
  const list = tab === "receivables" ? receivables : payments;
  const total = list.data?.totalItems ?? 0;

  const [open, setOpen] = useState<number | true | null>(params.get("action") === "create" ? true : null);
  const [receipt, setReceipt] = useState<number | null>(null);
  const [reasonFor, setReasonFor] = useState<{ kind: "reject" | "cancel"; row: PaymentResponse } | null>(null);
  const [refundFor, setRefundFor] = useState<ReceivableResponse | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (list.loading || list.error || !list.data) return;
    const last = Math.max(1, Math.ceil(total / 10));
    if (page > last) setParams(prev => { const next = new URLSearchParams(prev); next.set("page", String(last)); return next; }, { replace: true });
  }, [list.loading, list.error, list.data, total, page, setParams]);

  function set(key: string, value: string) {
    setParams(prev => { const next = new URLSearchParams(prev); if (value) next.set(key, value); else next.delete(key); if (key !== "page") next.set("page", "1"); return next; });
  }
  function reloadAll() { summary.reload(); payments.reload(); receivables.reload(); }

  async function confirm(row: PaymentResponse) {
    setBusyId(row.id);
    try {
      const res = await api.send<{ message: string }>("POST", `payments/${row.id}/confirm`, {});
      notify({ title: "Đã xác nhận", description: res.message });
      reloadAll();
    } catch (e) { notify({ title: "Không xác nhận được", description: e instanceof Error ? e.message : "", tone: "error" }); }
    finally { setBusyId(null); }
  }

  const s = summary.data;
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pending", label: "Chờ xác nhận", count: s?.pendingCount },
    { key: "receivables", label: "Công nợ", count: s?.debtorCount },
    { key: "receipts", label: "Tất cả phiếu" },
  ];

  return (
    <div className="admin-api-stack">
      <div className="admin-pay-kpis">
        <Card><span>Phải thu</span><strong>{s ? money(s.receivable) : "…"}</strong></Card>
        <Card><span>Đã thu (đã xác nhận)</span><strong className="is-ok">{s ? money(s.collected) : "…"}</strong></Card>
        <Card><span>Còn nợ</span><strong className="is-bad">{s ? money(s.outstanding) : "…"}</strong></Card>
        <Card><span>Chờ xác nhận</span><strong className="is-warn">{s ? `${s.pendingCount} · ${money(s.pendingAmount)}` : "…"}</strong></Card>
      </div>

      <div className="admin-api-toolbar">
        <div className="admin-pay-tabs" role="tablist" aria-label="Học phí">
          {tabs.map(t => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
              onClick={() => setParams({ tab: t.key })}>
              {t.label}{t.count ? <span>{t.count}</span> : null}
            </button>
          ))}
        </div>
        <Button variant="primary" icon="plus" onClick={() => setOpen(true)}>Lập phiếu thu</Button>
      </div>

      <div className="admin-api-filters">
        <SearchField label="Học viên / mã lớp" placeholder={tab === "receipts" ? "Tên, mã HV, mã lớp, số biên lai, mã CK…" : "Tên, mã HV hoặc mã lớp…"} value={search} onSearch={value => set("search", value)} />
        {tab === "receipts" && <>
          <SelectField label="Trạng thái" value={status} onChange={e => set("status", e.target.value)} options={[{ value: "", label: "Tất cả" }, ...Object.entries(statusLabel).map(([value, label]) => ({ value, label }))]} />
          <SelectField label="Hình thức" value={method} onChange={e => set("method", e.target.value)} options={[{ value: "", label: "Tất cả" }, { value: "Cash", label: "Tiền mặt" }, { value: "Transfer", label: "Chuyển khoản" }]} />
          <InputField label="Từ ngày" type="date" max={to || undefined} value={from} error={invalidRange ? "Ngày bắt đầu phải trước ngày kết thúc." : undefined} onChange={e => set("from", e.target.value)} />
          <InputField label="Đến ngày" type="date" min={from || undefined} value={to} onChange={e => set("to", e.target.value)} />
        </>}
        <Button icon="refresh" loading={list.loading} onClick={reloadAll}>Tải lại</Button>
      </div>

      {list.error ? <Notice tone="error" action={<Button onClick={list.reload}>Thử lại</Button>}>{list.error}</Notice> : !invalidRange && (
        <Card>
          <div className="admin-api-table" role="region" aria-label="Danh sách học phí" tabIndex={0}>
            {tab === "receivables" ? (
              <table className="admin-table" aria-busy={receivables.loading}>
                <thead><tr><th>Học viên</th><th>Lớp</th><th>Phải thu</th><th>Đã thu</th><th>Còn nợ</th><th>Thao tác</th></tr></thead>
                <tbody>{receivables.loading ? <TableSkeleton columns={6} /> : (receivables.data?.items ?? []).map(r => (
                  <tr key={r.enrollmentId}>
                    <td><strong>{r.studentName}</strong><span className="admin-management-subtitle">{r.studentCode} · {r.studentPhone}</span></td>
                    <td><span className="admin-code">{r.classCode}</span><span className="admin-management-subtitle">{r.courseName}</span></td>
                    <td>{money(r.finalTuitionFee)}</td>
                    <td>{money(r.paidAmount - r.refundedAmount)}{r.pendingAmount > 0 && <span className="admin-management-subtitle">+ {money(r.pendingAmount)} chờ xác nhận</span>}</td>
                    <td><strong>{money(r.remainingAmount)}</strong><span className="admin-management-subtitle"><Badge tone={payTone[r.paymentStatus]}>{payLabel[r.paymentStatus]}</Badge></span></td>
                    <td><div className="admin-row-actions">
                      <Button variant="primary" onClick={() => setOpen(r.studentId)}>Thu tiền</Button>
                      {r.paidAmount - r.refundedAmount > 0 && <Button variant="ghost" onClick={() => setRefundFor(r)}>Hoàn tiền</Button>}
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            ) : (
              <table className="admin-table" aria-busy={payments.loading}>
                <thead><tr><th>Số phiếu</th><th>Học viên</th><th>Lớp</th><th>Số tiền</th><th>Ngày / Hình thức</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>{payments.loading ? <TableSkeleton columns={7} /> : (payments.data?.items ?? []).map(p => (
                  <tr key={p.id}>
                    <td>{p.receiptNo ?? <span className="admin-api-muted">—</span>}{p.requestedByStudent && <span className="admin-management-subtitle">Học viên báo CK</span>}</td>
                    <td><strong>{p.studentName}</strong><span className="admin-management-subtitle">{p.studentCode}</span></td>
                    <td><span className="admin-code">{p.classCode}</span><span className="admin-management-subtitle">{p.courseName}</span></td>
                    <td><strong>{p.kind === "Refund" ? "−" : ""}{money(p.amount)}</strong><span className="admin-management-subtitle">{p.kind === "Refund" ? "Hoàn tiền" : `/ phải thu ${money(p.finalTuitionFee)}`}</span></td>
                    <td>{display(p.paidDate)}<span className="admin-management-subtitle">{p.method === "Transfer" ? "Chuyển khoản" : "Tiền mặt"}{p.transferRef ? ` · ${p.transferRef}` : ""}</span></td>
                    <td><Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>{p.cancelReason && <span className="admin-management-subtitle">{p.cancelReason}</span>}</td>
                    <td><div className="admin-row-actions">
                      {p.status === "Pending" && <>
                        <Button variant="primary" icon="check" loading={busyId === p.id} onClick={() => confirm(p)}>Xác nhận</Button>
                        <Button variant="ghost" onClick={() => setReasonFor({ kind: "reject", row: p })}>Từ chối</Button>
                      </>}
                      {p.status === "Confirmed" && <>
                        <Button icon="eye" onClick={() => setReceipt(p.id)}>Biên lai</Button>
                        <Button variant="ghost" onClick={() => setReasonFor({ kind: "cancel", row: p })}>Hủy phiếu</Button>
                      </>}
                      {(p.status === "Rejected" || p.status === "Cancelled") && <Button variant="ghost" icon="eye" onClick={() => setReceipt(p.id)}>Xem</Button>}
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
          {!list.loading && total === 0 && (
            <EmptyState
              title={tab === "pending" ? "Không có yêu cầu chờ xác nhận" : tab === "receivables" ? "Không còn khoản nợ" : "Chưa có phiếu nào"}
              description={tab === "pending" ? "Khi học viên báo đã chuyển khoản, yêu cầu sẽ hiện ở đây để đối soát." : "Thử đổi bộ lọc hoặc từ khóa."} />
          )}
        </Card>
      )}
      {!invalidRange && total > 10 && <Pager page={page} total={total} loading={list.loading} onChange={value => set("page", String(value))} />}

      {open !== null && (
        <CreatePayment studentId={typeof open === "number" ? open : undefined}
          close={() => { setOpen(null); setParams(prev => { const next = new URLSearchParams(prev); next.delete("action"); return next; }, { replace: true }); }}
          saved={() => { reloadAll(); notify({ title: "Đã lập phiếu thu", description: "Mở biên lai từ tab Tất cả phiếu để in." }); }} />
      )}
      {receipt !== null && <Receipt id={receipt} close={() => setReceipt(null)} />}
      {reasonFor && (
        <ReasonDialog
          title={reasonFor.kind === "reject" ? `Từ chối yêu cầu của ${reasonFor.row.studentCode}` : `Hủy phiếu ${reasonFor.row.receiptNo ?? ""}`}
          label={reasonFor.kind === "reject" ? "Lý do (học viên sẽ thấy): vd chưa nhận được tiền, sai số tiền…" : "Lý do hủy phiếu (lập nhầm, trùng…)"}
          confirmText={reasonFor.kind === "reject" ? "Từ chối" : "Hủy phiếu"}
          onClose={() => setReasonFor(null)}
          onSubmit={async reason => {
            await api.send("POST", `payments/${reasonFor.row.id}/${reasonFor.kind}`, { reason });
            notify({ title: reasonFor.kind === "reject" ? "Đã từ chối yêu cầu" : "Đã hủy phiếu" });
            reloadAll();
          }} />
      )}
      {refundFor && <RefundDialog row={refundFor} onClose={() => setRefundFor(null)} saved={() => { reloadAll(); notify({ title: "Đã lập phiếu hoàn" }); }} />}
    </div>
  );
}
