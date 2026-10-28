import { useState } from "react";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField, TextareaField } from "../../../components/ui/FormField";
import { courses } from "../../../data/courses";
import { adminMockUsers } from "../../../data/AdminData/mockUsers";
import { CURRENT_TEACHER_ID } from "../../../data/TeacherData/currentTeacher";
import { teacherAssignmentsSeed, teacherSubmissionsSeed } from "../../../data/TeacherData/assignments";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { Assignment, Submission, SubmissionStatus } from "../../../types";

const statusLabel: Record<SubmissionStatus, string> = {
    submitted: "Đã nộp",
    not_submitted: "Chưa nộp",
    graded: "Đã chấm",
};

const statusTone: Record<SubmissionStatus, "yellow" | "red" | "green"> = {
    submitted: "yellow",
    not_submitted: "red",
    graded: "green",
};

type FormState = { course_id: string; title: string; description: string; due_date: string };

function emptyForm(defaultCourseId: number): FormState {
    return {
        course_id: String(defaultCourseId),
        title: "",
        description: "",
        due_date: new Date().toISOString().slice(0, 10),
    };
}

export default function Assignments() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);

    const { items: assignments, add } = useLocalCollection<Assignment>(
        "teacher_assignments",
        teacherAssignmentsSeed
    );
    const { items: submissions, update: updateSubmission } = useLocalCollection<Submission>(
        "teacher_submissions",
        teacherSubmissionsSeed
    );

    const myAssignments = assignments.filter((a) => myCourses.some((c) => c.course_id === a.course_id));

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm(myCourses[0]?.course_id ?? 0));
    const [expandedId, setExpandedId] = useState<number | null>(null);

    function handleSubmit() {
        if (!form.title.trim()) {
            window.alert("Vui lòng nhập tiêu đề bài tập.");
            return;
        }
        add({
            assignment_id: nextId(assignments, (a) => a.assignment_id),
            course_id: Number(form.course_id),
            title: form.title,
            description: form.description,
            due_date: form.due_date,
            created_at: new Date().toISOString().slice(0, 10),
        });
        setModalOpen(false);
        setForm(emptyForm(myCourses[0]?.course_id ?? 0));
    }

    function gradeSubmission(submissionId: number) {
        const scoreStr = window.prompt("Nhập điểm (0-10):");
        if (scoreStr === null) return;
        const score = Number(scoreStr);
        if (Number.isNaN(score)) return;
        const feedback = window.prompt("Nhận xét (tùy chọn):") ?? undefined;
        updateSubmission(
            (s) => s.submission_id === submissionId,
            (s) => ({ ...s, status: "graded", score, feedback })
        );
    }

    return (
        <div className="teacher-table-page">
            <div className="teacher-table-toolbar">
                <p className="teacher-table-count">{myAssignments.length} bài tập</p>
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                    + Giao bài tập mới
                </Button>
            </div>

            {myAssignments.map((a) => {
                const course = courses.find((c) => c.course_id === a.course_id);
                const relatedSubmissions = submissions.filter((s) => s.assignment_id === a.assignment_id);
                const isExpanded = expandedId === a.assignment_id;
                return (
                    <Card key={a.assignment_id} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{a.title}</h3>
                                <p style={{ color: "var(--muted)", margin: "6px 0" }}>{a.description}</p>
                                <p style={{ fontSize: 13, color: "var(--ink)", margin: 0 }}>
                                    {course?.course_name} · Hạn nộp: {a.due_date}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="teacher-action-link"
                                onClick={() => setExpandedId(isExpanded ? null : a.assignment_id)}
                            >
                                {isExpanded ? "Ẩn bài nộp" : "Xem bài nộp"}
                            </button>
                        </div>

                        {isExpanded && (
                            <table className="teacher-table" style={{ marginTop: 16 }}>
                                <thead>
                                    <tr>
                                        <th>Học viên</th>
                                        <th>Trạng thái</th>
                                        <th>Điểm</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedSubmissions.map((s) => {
                                        const student = adminMockUsers.find((u) => u.user_id === s.user_id);
                                        return (
                                            <tr key={s.submission_id}>
                                                <td>{student?.full_name ?? `#${s.user_id}`}</td>
                                                <td>
                                                    <Tag tone={statusTone[s.status]}>{statusLabel[s.status]}</Tag>
                                                </td>
                                                <td>{s.score ?? "—"}</td>
                                                <td>
                                                    {s.status !== "not_submitted" && (
                                                        <button
                                                            type="button"
                                                            className="teacher-action-link"
                                                            onClick={() => gradeSubmission(s.submission_id)}
                                                        >
                                                            Chấm điểm
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {relatedSubmissions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="teacher-table-empty">
                                                Chưa có bài nộp nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </Card>
                );
            })}

            <Modal
                title="Giao bài tập mới"
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Giao bài tập
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
                <InputField label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <TextareaField
                    label="Mô tả bài tập"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                />
                <InputField
                    label="Hạn nộp"
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
            </Modal>
        </div>
    );
}
