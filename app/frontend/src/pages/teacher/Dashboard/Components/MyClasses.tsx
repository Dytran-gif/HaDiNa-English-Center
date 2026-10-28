import Card from "../../../../components/ui/Card";
import StatBlock from "../../../../components/ui/StatBlock";
import { courses } from "../../../../data/courses";
import { CURRENT_TEACHER_ID } from "../../../../data/TeacherData/currentTeacher";

function MyClasses() {
    const myCourses = courses.filter((c) => c.teacher_id === CURRENT_TEACHER_ID);

    return (
        <div className="teacher-stats-grid">
            <Card>
                <StatBlock value={String(myCourses.length)} label="Lớp đang phụ trách" />
            </Card>
            <Card>
                <StatBlock
                    value={String(myCourses.reduce((sum, c) => sum + c.duration_weeks, 0))}
                    label="Tổng số tuần giảng dạy"
                />
            </Card>
        </div>
    );
}

export default MyClasses;
