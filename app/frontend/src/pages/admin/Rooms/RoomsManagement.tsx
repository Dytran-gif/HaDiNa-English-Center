import { useState } from "react";
import "../admin-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import Modal from "../../../components/ui/Modal";
import { InputField } from "../../../components/ui/FormField";
import { adminRooms, adminRoomAssignments } from "../../../data/AdminData/rooms";
import { courses } from "../../../data/courses";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { Room, RoomAssignment } from "../../../types";

type FormState = { room_name: string; capacity: string; location: string };
const emptyForm: FormState = { room_name: "", capacity: "", location: "" };

export default function RoomsManagement() {
    const { items: rooms, add, update, remove } = useLocalCollection<Room>("admin_rooms", adminRooms);
    const {
        items: assignments,
        update: updateAssignment,
        add: addAssignment,
    } = useLocalCollection<RoomAssignment>("admin_room_assignments", adminRoomAssignments);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    function openAddModal() {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    }

    function openEditModal(room: Room) {
        setEditingId(room.room_id);
        setForm({ room_name: room.room_name, capacity: String(room.capacity), location: room.location });
        setModalOpen(true);
    }

    function handleDelete(roomId: number) {
        if (!window.confirm("Xóa phòng học này?")) return;
        remove((r) => r.room_id === roomId);
    }

    function handleSubmit() {
        if (!form.room_name.trim()) {
            window.alert("Vui lòng nhập tên phòng.");
            return;
        }
        if (editingId !== null) {
            update(
                (r) => r.room_id === editingId,
                (r) => ({ ...r, room_name: form.room_name, capacity: Number(form.capacity) || 0, location: form.location })
            );
        } else {
            const newRoom: Room = {
                room_id: nextId(rooms, (r) => r.room_id),
                room_name: form.room_name,
                capacity: Number(form.capacity) || 0,
                location: form.location,
            };
            add(newRoom);
        }
        setModalOpen(false);
    }

    function assignRoom(courseId: number, roomId: number) {
        const exists = assignments.some((a) => a.course_id === courseId);
        if (exists) {
            updateAssignment(
                (a) => a.course_id === courseId,
                (a) => ({ ...a, room_id: roomId })
            );
        } else {
            addAssignment({
                assignment_id: nextId(assignments, (a) => a.assignment_id),
                course_id: courseId,
                room_id: roomId,
            });
        }
    }

    return (
        <div className="admin-table-page">
            <div className="admin-table-toolbar">
                <p className="admin-table-count">{rooms.length} phòng học</p>
                <Button variant="primary" onClick={openAddModal}>
                    + Thêm phòng học
                </Button>
            </div>

            <Card>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tên phòng</th>
                            <th>Sức chứa</th>
                            <th>Vị trí</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((r) => (
                            <tr key={r.room_id}>
                                <td>{r.room_name}</td>
                                <td><Tag tone="ink">{r.capacity} chỗ</Tag></td>
                                <td>{r.location}</td>
                                <td>
                                    <div className="admin-row-actions">
                                        <button type="button" className="admin-action-link" onClick={() => openEditModal(r)}>
                                            Sửa
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-action-link admin-action-danger"
                                            onClick={() => handleDelete(r.room_id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Card className="admin-recent-card" style={{ marginTop: 20 }}>
                <div className="admin-recent-header">
                    <h2>Phân bổ phòng học theo khóa học</h2>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Khóa học</th>
                            <th>Phòng học được gán</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => {
                            const assignment = assignments.find((a) => a.course_id === c.course_id);
                            return (
                                <tr key={c.course_id}>
                                    <td>{c.course_name}</td>
                                    <td>
                                        <select
                                            className="field__control"
                                            style={{ maxWidth: 240 }}
                                            value={assignment?.room_id ?? ""}
                                            onChange={(e) => assignRoom(c.course_id, Number(e.target.value))}
                                        >
                                            <option value="" disabled>
                                                Chọn phòng
                                            </option>
                                            {rooms.map((r) => (
                                                <option key={r.room_id} value={r.room_id}>
                                                    {r.room_name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>

            <Modal
                title={editingId !== null ? "Sửa phòng học" : "Thêm phòng học mới"}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingId !== null ? "Lưu thay đổi" : "Thêm phòng"}
                        </Button>
                    </>
                }
            >
                <InputField label="Tên phòng" value={form.room_name} onChange={(e) => setForm({ ...form, room_name: e.target.value })} />
                <InputField
                    label="Sức chứa"
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
                <InputField label="Vị trí" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Modal>
        </div>
    );
}
