import { useState, useRef } from "react";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField, TextareaField } from "../../../components/ui/FormField";
import { courses } from "../../../data/courses";
import { CURRENT_TEACHER_ID } from "../../../data/TeacherData/currentTeacher";
import { teacherMaterialsSeed } from "../../../data/TeacherData/materials";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { TeachingMaterial } from "../../../types";

type FormState = { course_id: string; title: string; description: string; file_name: string };

export default function Materials() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);
    const { items: materials, add, remove } = useLocalCollection<TeachingMaterial>(
        "teacher_materials",
        teacherMaterialsSeed
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<FormState>({
        course_id: String(myCourses[0]?.course_id ?? ""),
        title: "",
        description: "",
        file_name: "",
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange() {
        const file = fileInputRef.current?.files?.[0];
        if (file) setForm((f) => ({ ...f, file_name: file.name }));
    }

    function handleSubmit() {
        if (!form.title.trim() || !form.file_name.trim()) {
            window.alert("Vui lòng nhập tiêu đề và chọn tệp tài liệu.");
            return;
        }
        add({
            material_id: nextId(materials, (m) => m.material_id),
            course_id: Number(form.course_id),
            teacher_id: CURRENT_TEACHER_ID,
            title: form.title,
            description: form.description,
            file_name: form.file_name,
            uploaded_at: new Date().toISOString().slice(0, 10),
        });
        setModalOpen(false);
        setForm({ course_id: String(myCourses[0]?.course_id ?? ""), title: "", description: "", file_name: "" });
    }

    function handleDelete(materialId: number) {
        if (!window.confirm("Xóa tài liệu này?")) return;
        remove((m) => m.material_id === materialId);
    }

    return (
        <div className="teacher-table-page">
            <div className="teacher-table-toolbar">
                <p className="teacher-table-count">{materials.length} tài liệu</p>
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                    + Thêm tài liệu
                </Button>
            </div>

            <Card>
                <table className="teacher-table">
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Lớp học</th>
                            <th>Tệp đính kèm</th>
                            <th>Ngày tải lên</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((m) => {
                            const course = courses.find((c) => c.course_id === m.course_id);
                            return (
                                <tr key={m.material_id}>
                                    <td>
                                        {m.title}
                                        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{m.description}</div>
                                    </td>
                                    <td>{course?.course_name ?? "—"}</td>
                                    <td>{m.file_name}</td>
                                    <td>{m.uploaded_at}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="teacher-action-link teacher-action-danger"
                                            onClick={() => handleDelete(m.material_id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {materials.length === 0 && (
                            <tr>
                                <td colSpan={5} className="teacher-table-empty">
                                    Chưa có tài liệu nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                title="Thêm tài liệu giảng dạy"
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Thêm tài liệu
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
                    label="Mô tả"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                />
                <div className="field">
                    <label className="field__label" htmlFor="material-file">
                        Chọn tệp
                    </label>
                    <input id="material-file" type="file" ref={fileInputRef} onChange={handleFileChange} className="field__control" />
                    {form.file_name && (
                        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Đã chọn: {form.file_name}</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
