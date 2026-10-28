import { useState } from "react";
import "../admin-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import StatBlock from "../../../components/ui/StatBlock";
import Modal from "../../../components/ui/Modal";
import "../Dashboard/Dashboard.css";
import { InputField, SelectField, TextareaField } from "../../../components/ui/FormField";
import { adminPayments } from "../../../data/AdminData/payments";
import { adminMockUsers } from "../../../data/AdminData/mockUsers";
import { courses, formatPrice } from "../../../data/courses";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { Payment, PaymentMethod, PaymentStatus } from "../../../types";

const statusLabel: Record<PaymentStatus, string> = {
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    overdue: "Quá hạn",
};

const statusTone: Record<PaymentStatus, "green" | "yellow" | "red"> = {
    paid: "green",
    unpaid: "yellow",
    overdue: "red",
};

const methodLabel: Record<PaymentMethod, string> = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    card: "Thẻ",
};

const students = adminMockUsers.filter((u) => u.role === "student");

type FormState = {
    user_id: string;
    course_id: string;
    amount: string;
    method: PaymentMethod;
    due_date: string;
    note: string;
};

function emptyForm(): FormState {
    return {
        user_id: String(students[0]?.user_id ?? ""),
        course_id: String(courses[0]?.course_id ?? ""),
        amount: "",
        method: "cash",
        due_date: new Date().toISOString().slice(0, 10),
        note: "",
    };
}

function findUserName(userId: number) {
    return adminMockUsers.find((u) => u.user_id === userId)?.full_name ?? `#${userId}`;
}

function findCourseName(courseId: number) {
    return courses.find((c) => c.course_id === courseId)?.course_name ?? `#${courseId}`;
}

export default function PaymentsManagement() {
    const { items: payments, add, update } = useLocalCollection<Payment>(
        "admin_payments",
        adminPayments
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");

    const filtered = statusFilter === "all" ? payments : payments.filter((p) => p.status === statusFilter);

    const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const totalUnpaid = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0);

    function togglePaid(payment: Payment) {
        update(
            (p) => p.payment_id === payment.payment_id,
            (p) => ({
                ...p,
                status: p.status === "paid" ? "unpaid" : "paid",
                paid_date: p.status === "paid" ? undefined : new Date().toISOString().slice(0, 10),
            })
        );
    }

    function handleSubmit() {
        if (!form.amount || Number(form.amount) <= 0) {
            window.alert("Vui lòng nhập số tiền hợp lệ.");
            return;
        }
        const newPayment: Payment = {
            payment_id: nextId(payments, (p) => p.payment_id),
            user_id: Number(form.user_id),
            course_id: Number(form.course_id),
            amount: Number(form.amount),
            status: "unpaid",
            method: form.method,
            due_date: form.due_date,
            note: form.note || undefined,
        };
        add(newPayment);
        setModalOpen(false);
        setForm(emptyForm());
    }

    return (
        <div className="admin-table-page">
            <div className="admin-stats-grid admin-stats-grid--three">
                <Card>
                    <StatBlock value={formatPrice(totalRevenue)} label="Đã thu" />
                </Card>
                <Card>
                    <StatBlock value={formatPrice(totalUnpaid)} label="Chưa thu / quá hạn" />
                </Card>
                <Card>
                    <StatBlock value={String(payments.length)} label="Tổng hóa đơn" />
                </Card>
            </div>

            <div className="admin-table-toolbar">
                <div className="admin-tag-row">
                    <button
                        type="button"
                        className={`admin-filter-chip ${statusFilter === "all" ? "active" : ""}`}
                        onClick={() => setStatusFilter("all")}
                    >
                        Tất cả
                    </button>
                    {(Object.keys(statusLabel) as PaymentStatus[]).map((s) => (
                        <button
                            key={s}
                            type="button"
                            className={`admin-filter-chip ${statusFilter === s ? "active" : ""}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {statusLabel[s]}
                        </button>
                    ))}
                </div>
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                    + Thêm hóa đơn
                </Button>
            </div>

            <Card>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Khóa học</th>
                            <th>Số tiền</th>
                            <th>Hạn thanh toán</th>
                            <th>Hình thức</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.payment_id}>
                                <td>{findUserName(p.user_id)}</td>
                                <td>{findCourseName(p.course_id)}</td>
                                <td>{formatPrice(p.amount)}</td>
                                <td>{p.due_date}</td>
                                <td>{methodLabel[p.method]}</td>
                                <td>
                                    <Tag tone={statusTone[p.status]}>{statusLabel[p.status]}</Tag>
                                </td>
                                <td>
                                    <button type="button" className="admin-action-link" onClick={() => togglePaid(p)}>
                                        {p.status === "paid" ? "Đánh dấu chưa thu" : "Đánh dấu đã thu"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="admin-table-empty">
                                    Không có hóa đơn phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                title="Thêm hóa đơn mới"
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Thêm hóa đơn
                        </Button>
                    </>
                }
            >
                <SelectField
                    label="Học viên"
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    options={students.map((s) => ({ value: String(s.user_id), label: s.full_name }))}
                />
                <SelectField
                    label="Khóa học"
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    options={courses.map((c) => ({ value: String(c.course_id), label: c.course_name }))}
                />
                <InputField
                    label="Số tiền (VNĐ)"
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                <SelectField
                    label="Hình thức thanh toán"
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
                    options={[
                        { value: "cash", label: "Tiền mặt" },
                        { value: "bank_transfer", label: "Chuyển khoản" },
                        { value: "card", label: "Thẻ" },
                    ]}
                />
                <InputField
                    label="Hạn thanh toán"
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
                <TextareaField
                    label="Ghi chú (tùy chọn)"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    rows={2}
                />
            </Modal>
        </div>
    );
}
