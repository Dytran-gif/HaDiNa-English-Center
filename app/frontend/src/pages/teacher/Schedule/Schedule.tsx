import { useState } from "react";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField, TextareaField } from "../../../components/ui/FormField";
import { courses } from "../../../data/courses";
import { CURRENT_TEACHER_ID } from "../../../data/TeacherData/currentTeacher";
import { teacherScheduleRequestsSeed } from "../../../data/TeacherData/scheduleRequests";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { RequestStatus, RequestType, ScheduleRequest } from "../../../types";

const typeLabel: Record<RequestType, string> = { leave: "Xin nghỉ", swap: "Đổi lịch" };
const statusLabel: Record<RequestStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
};
const statusTone: Record<RequestStatus, "yellow" | "green" | "red"> = {
    pending: "yellow",
    approved: "green",
    rejected: "red",
};

type FormState = {
    course_id: string;
    type: RequestType;
    original_date: string;
    proposed_date: string;
    reason: string;
};

function emptyForm(defaultCourseId: number): FormState {
    return {
        course_id: String(defaultCourseId),
        type: "leave",
        original_date: new Date().toISOString().slice(0, 10),
        proposed_date: "",
        reason: "",
    };
}

export default function Schedule() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);
    const { items: requests, add } = useLocalCollection<ScheduleRequest>(
        "teacher_schedule_requests",
        teacherScheduleRequestsSeed
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm(myCourses[0]?.course_id ?? 0));

    const myRequests = requests
        .filter((r) => r.teacher_id === CURRENT_TEACHER_ID)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));

    function handleSubmit() {
        if (!form.reason.trim()) {
            window.alert("Vui lòng nhập lý do.");
            return;
        }
        if (form.type === "swap" && !form.proposed_date) {
            window.alert("Vui lòng chọn ngày muốn đổi sang.");
            return;
        }
        add({
            request_id: nextId(requests, (r) => r.request_id),
            teacher_id: CURRENT_TEACHER_ID,
            course_id: Number(form.course_id),
            type: form.type,
            original_date: form.original_date,
            proposed_date: form.type === "swap" ? form.proposed_date : undefined,
            reason: form.reason,
            status: "pending",
            created_at: new Date().toISOString().slice(0, 10),
        });
        setModalOpen(false);
        setForm(emptyForm(myCourses[0]?.course_id ?? 0));
    }

    return (
        <div className="teacher-table-page">
            <Card style={{ marginBottom: 20 }}>
                <table className="teacher-table">
                    <thead>
                        <tr>
                            <th>Khóa học</th>
                            <th>Lịch học</th>
                            <th>Trình độ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myCourses.map((c) => (
                            <tr key={c.course_id}>
                                <td>{c.course_name}</td>
                                <td>{c.schedule}</td>
                                <td>{c.level}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <div className="teacher-table-toolbar">
                <h2 style={{ margin: 0, fontSize: 18, color: "var(--ink)" }}>Yêu cầu xin nghỉ / đổi lịch</h2>
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                    + Tạo yêu cầu
                </Button>
            </div>

            <Card>
                <table className="teacher-table">
                    <thead>
                        <tr>
                            <th>Loại</th>
                            <th>Lớp học</th>
                            <th>Ngày gốc</th>
                            <th>Ngày đề xuất</th>
                            <th>Lý do</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRequests.map((r) => {
                            const course = courses.find((c) => c.course_id === r.course_id);
                            return (
                                <tr key={r.request_id}>
                                    <td>{typeLabel[r.type]}</td>
                                    <td>{course?.course_name ?? "—"}</td>
                                    <td>{r.original_date}</td>
                                    <td>{r.proposed_date ?? "—"}</td>
                                    <td>{r.reason}</td>
                                    <td>
                                        <Tag tone={statusTone[r.status]}>{statusLabel[r.status]}</Tag>
                                    </td>
                                </tr>
                            );
                        })}
                        {myRequests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="teacher-table-empty">
                                    Bạn chưa gửi yêu cầu nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                title="Tạo yêu cầu xin nghỉ / đổi lịch"
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Gửi yêu cầu
                        </Button>
                    </>
                }
            >
                <SelectField
                    label="Lớp học"
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    options={myCourses.map((c) => ({ value: String(c.course_id), label: c.course_name }))}
                />
                <SelectField
                    label="Loại yêu cầu"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as RequestType })}
                    options={[
                        { value: "leave", label: "Xin nghỉ" },
                        { value: "swap", label: "Đổi lịch" },
                    ]}
                />
                <InputField
                    label="Ngày buổi học gốc"
                    type="date"
                    value={form.original_date}
                    onChange={(e) => setForm({ ...form, original_date: e.target.value })}
                />
                {form.type === "swap" && (
                    <InputField
                        label="Ngày muốn đổi sang"
                        type="date"
                        value={form.proposed_date}
                        onChange={(e) => setForm({ ...form, proposed_date: e.target.value })}
                    />
                )}
                <TextareaField
                    label="Lý do"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    rows={3}
                />
            </Modal>
        </div>
    );
}
