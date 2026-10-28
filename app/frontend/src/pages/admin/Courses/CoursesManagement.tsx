import { useState } from "react";
import "../admin-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField, TextareaField } from "../../../components/ui/FormField";
import { courses as coursesSeed, formatPrice } from "../../../data/courses";
import { categories, getCategoryById } from "../../../data/categories";
import { teachers } from "../../../data/teachers";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { Course } from "../../../types";

type FormState = {
    course_name: string;
    slug: string;
    short_description: string;
    description: string;
    category_id: string;
    teacher_id: string;
    price: string;
    duration_weeks: string;
    level: string;
    schedule: string;
};

const emptyForm: FormState = {
    course_name: "",
    slug: "",
    short_description: "",
    description: "",
    category_id: String(categories[0]?.category_id ?? ""),
    teacher_id: String(teachers[0]?.teacher_id ?? ""),
    price: "",
    duration_weeks: "",
    level: "",
    schedule: "",
};

export default function CoursesManagement() {
    const { items: courses, add, update, remove } = useLocalCollection<Course>(
        "admin_courses",
        coursesSeed
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    function openAddModal() {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    }

    function openEditModal(course: Course) {
        setEditingId(course.course_id);
        setForm({
            course_name: course.course_name,
            slug: course.slug,
            short_description: course.short_description,
            description: course.description,
            category_id: String(course.category_id),
            teacher_id: String(course.teacher_id),
            price: String(course.price),
            duration_weeks: String(course.duration_weeks),
            level: course.level,
            schedule: course.schedule,
        });
        setModalOpen(true);
    }

    function handleDelete(courseId: number) {
        if (!window.confirm("Xóa khóa học này? Hành động không thể hoàn tác.")) return;
        remove((c) => c.course_id === courseId);
    }

    function handleSubmit() {
        if (!form.course_name.trim() || !form.slug.trim()) {
            window.alert("Vui lòng nhập tên khóa học và slug.");
            return;
        }

        if (editingId !== null) {
            update(
                (c) => c.course_id === editingId,
                (c) => ({
                    ...c,
                    course_name: form.course_name,
                    slug: form.slug,
                    short_description: form.short_description,
                    description: form.description,
                    category_id: Number(form.category_id),
                    teacher_id: Number(form.teacher_id),
                    price: Number(form.price) || 0,
                    duration_weeks: Number(form.duration_weeks) || 0,
                    level: form.level,
                    schedule: form.schedule,
                })
            );
        } else {
            const newCourse: Course = {
                course_id: nextId(courses, (c) => c.course_id),
                course_name: form.course_name,
                slug: form.slug,
                short_description: form.short_description,
                description: form.description,
                category_id: Number(form.category_id),
                teacher_id: Number(form.teacher_id),
                price: Number(form.price) || 0,
                duration_weeks: Number(form.duration_weeks) || 0,
                level: form.level,
                schedule: form.schedule,
                outline: [],
            };
            add(newCourse);
        }
        setModalOpen(false);
    }

    return (
        <div className="admin-table-page">
            <div className="admin-table-toolbar">
                <p className="admin-table-count">{courses.length} khóa học</p>
                <Button variant="primary" onClick={openAddModal}>
                    + Thêm khóa học
                </Button>
            </div>

            <Card>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên khóa học</th>
                            <th>Danh mục</th>
                            <th>Trình độ</th>
                            <th>Thời lượng</th>
                            <th>Học phí</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => {
                            const category = getCategoryById(course.category_id);
                            return (
                                <tr key={course.course_id}>
                                    <td>{course.course_name}</td>
                                    <td>{category && <Tag tone="red">{category.category_name}</Tag>}</td>
                                    <td>{course.level}</td>
                                    <td>{course.duration_weeks} tuần</td>
                                    <td>{formatPrice(course.price)}</td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button
                                                type="button"
                                                className="admin-action-link"
                                                onClick={() => openEditModal(course)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-action-link admin-action-danger"
                                                onClick={() => handleDelete(course.course_id)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {courses.length === 0 && (
                            <tr>
                                <td colSpan={6} className="admin-table-empty">
                                    Chưa có khóa học nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                title={editingId !== null ? "Sửa khóa học" : "Thêm khóa học mới"}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingId !== null ? "Lưu thay đổi" : "Thêm khóa học"}
                        </Button>
                    </>
                }
            >
                <InputField
                    label="Tên khóa học"
                    value={form.course_name}
                    onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                />
                <InputField
                    label="Slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
                <TextareaField
                    label="Mô tả ngắn"
                    value={form.short_description}
                    onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                    rows={2}
                />
                <TextareaField
                    label="Mô tả chi tiết"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                />
                <SelectField
                    label="Danh mục"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    options={categories.map((c) => ({ value: String(c.category_id), label: c.category_name }))}
                />
                <SelectField
                    label="Giáo viên phụ trách"
                    value={form.teacher_id}
                    onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                    options={teachers.map((t) => ({ value: String(t.teacher_id), label: t.full_name }))}
                />
                <InputField
                    label="Học phí (VNĐ)"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <InputField
                    label="Thời lượng (tuần)"
                    type="number"
                    value={form.duration_weeks}
                    onChange={(e) => setForm({ ...form, duration_weeks: e.target.value })}
                />
                <InputField
                    label="Trình độ"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                />
                <InputField
                    label="Lịch học"
                    value={form.schedule}
                    onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                />
            </Modal>
        </div>
    );
}
