import { useMemo, useState } from "react";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { InputField, SelectField } from "../../../components/ui/FormField";
import { courses } from "../../../data/courses";
import { adminMockUsers } from "../../../data/AdminData/mockUsers";
import { CURRENT_TEACHER_ID } from "../../../data/TeacherData/currentTeacher";
import { getStudentIdsByCourse } from "../../../data/TeacherData/classRoster";
import { teacherAttendanceSeed } from "../../../data/TeacherData/attendance";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { AttendanceRecord, AttendanceStatus } from "../../../types";

const statusLabel: Record<AttendanceStatus, string> = {
    present: "Có mặt",
    absent: "Vắng",
    late: "Trễ",
    excused: "Có phép",
};

const statusTone: Record<AttendanceStatus, "green" | "red" | "yellow" | "ink"> = {
    present: "green",
    absent: "red",
    late: "yellow",
    excused: "ink",
};

export default function Attendance() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);
    const [courseId, setCourseId] = useState(myCourses[0]?.course_id ?? 0);
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));

    const { items: records, add, update } = useLocalCollection<AttendanceRecord>(
        "teacher_attendance",
        teacherAttendanceSeed
    );

    const studentIds = getStudentIdsByCourse(courseId);
    const students = adminMockUsers.filter((u) => studentIds.includes(u.user_id));

    const sessionRecords = useMemo(
        () => records.filter((r) => r.course_id === courseId && r.session_date === sessionDate),
        [records, courseId, sessionDate]
    );

    function getStatus(userId: number): AttendanceStatus | null {
        return sessionRecords.find((r) => r.user_id === userId)?.status ?? null;
    }

    function setStatus(userId: number, status: AttendanceStatus) {
        const existing = records.find(
            (r) => r.course_id === courseId && r.session_date === sessionDate && r.user_id === userId
        );
        if (existing) {
            update(
                (r) => r.attendance_id === existing.attendance_id,
                (r) => ({ ...r, status })
            );
        } else {
            add({
                attendance_id: nextId(records, (r) => r.attendance_id),
                course_id: courseId,
                user_id: userId,
                session_date: sessionDate,
                status,
            });
        }
    }

    return (
        <div className="teacher-table-page">
            <Card style={{ marginBottom: 16 }}>
                <div className="teacher-filter-row">
                    <SelectField
                        label="Lớp học"
                        value={String(courseId)}
                        onChange={(e) => setCourseId(Number(e.target.value))}
                        options={myCourses.map((c) => ({ value: String(c.course_id), label: c.course_name }))}
                    />
                    <InputField
                        label="Ngày học"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                    />
                </div>
            </Card>

            <Card>
                <table className="teacher-table">
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Trạng thái hiện tại</th>
                            <th>Điểm danh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => {
                            const status = getStatus(s.user_id);
                            return (
                                <tr key={s.user_id}>
                                    <td>{s.full_name}</td>
                                    <td>{status ? <Tag tone={statusTone[status]}>{statusLabel[status]}</Tag> : <Tag tone="ink">Chưa điểm danh</Tag>}</td>
                                    <td>
                                        <div className="teacher-attendance-actions">
                                            {(Object.keys(statusLabel) as AttendanceStatus[]).map((st) => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    className={`teacher-attendance-btn ${status === st ? "active" : ""}`}
                                                    onClick={() => setStatus(s.user_id, st)}
                                                >
                                                    {statusLabel[st]}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={3} className="teacher-table-empty">
                                    Lớp này chưa có học viên trong dữ liệu demo.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
            <Button
                variant="ghost"
                style={{ marginTop: 12 }}
                onClick={() => window.alert("Đã lưu điểm danh (lưu tạm thời trên trình duyệt, chưa nối backend).")}
            >
                Xác nhận điểm danh
            </Button>
        </div>
    );
}
