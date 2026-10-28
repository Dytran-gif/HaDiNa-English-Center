import { useState } from "react";
import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { InputField, SelectField } from "../../../components/ui/FormField";
import { courses } from "../../../data/courses";
import { adminMockUsers } from "../../../data/AdminData/mockUsers";
import { CURRENT_TEACHER_ID } from "../../../data/TeacherData/currentTeacher";
import { getStudentIdsByCourse } from "../../../data/TeacherData/classRoster";
import { teacherGradesSeed } from "../../../data/TeacherData/grades";
import { useLocalCollection, nextId } from "../../../hooks/useLocalCollection";
import type { Grade } from "../../../types";

const skills = ["Listening", "Reading", "Writing", "Speaking"];

export default function Grades() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);
    const [courseId, setCourseId] = useState(myCourses[0]?.course_id ?? 0);
    const [skill, setSkill] = useState(skills[0]);

    const { items: grades, add, update } = useLocalCollection<Grade>("teacher_grades", teacherGradesSeed);

    const studentIds = getStudentIdsByCourse(courseId);
    const students = adminMockUsers.filter((u) => studentIds.includes(u.user_id));

    function getScore(userId: number) {
        return grades.find((g) => g.course_id === courseId && g.user_id === userId && g.skill === skill)?.score;
    }

    function setScore(userId: number, rawValue: string) {
        const value = Number(rawValue);
        if (Number.isNaN(value)) return;
        const existing = grades.find(
            (g) => g.course_id === courseId && g.user_id === userId && g.skill === skill
        );
        if (existing) {
            update(
                (g) => g.grade_id === existing.grade_id,
                (g) => ({ ...g, score: value, graded_at: new Date().toISOString().slice(0, 10) })
            );
        } else {
            add({
                grade_id: nextId(grades, (g) => g.grade_id),
                course_id: courseId,
                user_id: userId,
                skill,
                score: value,
                graded_at: new Date().toISOString().slice(0, 10),
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
                    <SelectField
                        label="Kỹ năng"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        options={skills.map((s) => ({ value: s, label: s }))}
                    />
                </div>
            </Card>

            <Card>
                <table className="teacher-table">
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>Điểm ({skill})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.user_id}>
                                <td>{s.full_name}</td>
                                <td style={{ maxWidth: 140 }}>
                                    <InputField
                                        label=""
                                        type="number"
                                        step="0.5"
                                        min={0}
                                        max={9}
                                        value={getScore(s.user_id) ?? ""}
                                        onChange={(e) => setScore(s.user_id, e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={2} className="teacher-table-empty">
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
                onClick={() => window.alert("Điểm đã lưu tạm thời trên trình duyệt (chưa nối backend).")}
            >
                Lưu bảng điểm
            </Button>
        </div>
    );
}
