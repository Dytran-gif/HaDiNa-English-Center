import "../teacher-shared.css";
import Card from "../../../components/ui/Card";
import { courses } from "../../../data/courses";
import { CURRENT_TEACHER_ID } from "../../../data/TeacherData/currentTeacher";

export default function Classes() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);

    return (
        <div className="teacher-table-page">
            {myCourses.map((c) => (
                <Card key={c.course_id} style={{ marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>{c.course_name}</h3>
                    <p style={{ color: "var(--muted)", marginTop: 6 }}>{c.short_description}</p>
                    <p style={{ marginTop: 10, fontSize: 13, color: "var(--ink)" }}>
                        {c.schedule} · {c.duration_weeks} tuần · {c.level}
                    </p>
                </Card>
            ))}
        </div>
    );
}
