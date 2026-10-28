import "./Dashboard.css";
import MyClasses from "./Components/MyClasses";
import Card from "../../../components/ui/Card";
import { courses } from "../../../data/courses";
import { CURRENT_TEACHER_ID } from "../../../data/TeacherData/currentTeacher";

export default function TeacherDashboard() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);

    return (
        <div className="teacher-dashboard">
            <MyClasses />

            <Card className="teacher-classes-card">
                <h2>Danh sách lớp</h2>
                <ul className="teacher-classes-list">
                    {myCourses.map((c) => (
                        <li key={c.course_id}>
                            <span>{c.course_name}</span>
                            <span className="teacher-classes-schedule">{c.schedule}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
