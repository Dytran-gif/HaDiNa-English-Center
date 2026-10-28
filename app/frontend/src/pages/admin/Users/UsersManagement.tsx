import { useState } from "react";
import "../admin-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import Modal from "../../../components/ui/Modal";
import { InputField, SelectField } from "../../../components/ui/FormField";
import { adminMockUsers } from "../../../data/AdminData/mockUsers";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { User, UserRole } from "../../../types";

const roleLabel: Record<string, string> = {
    student: "Học viên",
    teacher: "Giáo viên",
    admin: "Admin",
};

type FormState = {
    full_name: string;
    email: string;
    phone: string;
    role: UserRole;
};

const emptyForm: FormState = { full_name: "", email: "", phone: "", role: "student" };

export default function UsersManagement() {
    const { items: users, add, update, remove } = useLocalCollection<User>(
        "admin_users",
        adminMockUsers
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    function openAddModal() {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    }

    function openEditModal(user: User) {
        setEditingId(user.user_id);
        setForm({ full_name: user.full_name, email: user.email, phone: user.phone, role: user.role });
        setModalOpen(true);
    }

    function handleDelete(userId: number) {
        if (!window.confirm("Xóa người dùng này? Hành động không thể hoàn tác.")) return;
        remove((u) => u.user_id === userId);
    }

    function handleSubmit() {
        if (!form.full_name.trim() || !form.email.trim()) {
            window.alert("Vui lòng nhập họ tên và email.");
            return;
        }

        if (editingId !== null) {
            update(
                (u) => u.user_id === editingId,
                (u) => ({ ...u, ...form })
            );
        } else {
            const newUser: User = {
                user_id: nextId(users, (u) => u.user_id),
                ...form,
                created_at: new Date().toISOString(),
            };
            add(newUser);
        }
        setModalOpen(false);
    }

    return (
        <div className="admin-table-page">
            <div className="admin-table-toolbar">
                <p className="admin-table-count">{users.length} người dùng</p>
                <Button variant="primary" onClick={openAddModal}>
                    + Thêm người dùng
                </Button>
            </div>

            <Card>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.user_id}>
                                <td>{u.full_name}</td>
                                <td>{u.email}</td>
                                <td>{u.phone}</td>
                                <td>
                                    <Tag tone={u.role === "admin" ? "red" : u.role === "teacher" ? "green" : "ink"}>
                                        {roleLabel[u.role]}
                                    </Tag>
                                </td>
                                <td>
                                    <div className="admin-row-actions">
                                        <button type="button" className="admin-action-link" onClick={() => openEditModal(u)}>
                                            Sửa
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-action-link admin-action-danger"
                                            onClick={() => handleDelete(u.user_id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="admin-table-empty">
                                    Chưa có người dùng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <Modal
                title={editingId !== null ? "Sửa người dùng" : "Thêm người dùng mới"}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingId !== null ? "Lưu thay đổi" : "Thêm người dùng"}
                        </Button>
                    </>
                }
            >
                <InputField
                    label="Họ tên"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
                <InputField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <InputField
                    label="Số điện thoại"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <SelectField
                    label="Vai trò"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    options={[
                        { value: "student", label: "Học viên" },
                        { value: "teacher", label: "Giáo viên" },
                        { value: "admin", label: "Admin" },
                    ]}
                />
            </Modal>
        </div>
    );
}
