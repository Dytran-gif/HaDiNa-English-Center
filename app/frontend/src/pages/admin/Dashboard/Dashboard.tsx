import "./Dashboard.css";
import StatsOverview from "./Components/StatsOverview";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { courses } from "../../../data/courses";

export default function AdminDashboard() {
    const recentCourses = courses.slice(0, 5);

    return (
        <div className="admin-dashboard">
            <StatsOverview />

            <Card className="admin-recent-card">
                <div className="admin-recent-header">
                    <h2>Khóa học gần đây</h2>
                    <Button to="/admin/courses" variant="outline">
                        Xem tất cả
                    </Button>
                </div>

                <ul className="admin-recent-list">
                    {recentCourses.map((c) => (
                        <li key={c.course_id}>
                            <span>{c.course_name}</span>
                            <span className="admin-recent-level">{c.level}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
