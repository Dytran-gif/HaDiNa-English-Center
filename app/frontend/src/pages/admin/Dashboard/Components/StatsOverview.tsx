import Card from "../../../../components/ui/Card";
import StatBlock from "../../../../components/ui/StatBlock";
import { courses } from "../../../../data/courses";
import { teachers } from "../../../../data/teachers";
import { blogPosts } from "../../../../data/blogPosts";
import { adminMockUsers } from "../../../../data/AdminData/mockUsers";

function StatsOverview() {
    const studentCount = adminMockUsers.filter((u) => u.role === "student").length;

    return (
        <div className="admin-stats-grid">
            <Card>
                <StatBlock value={String(courses.length)} label="Khóa học đang mở" />
            </Card>
            <Card>
                <StatBlock value={String(teachers.length)} label="Giáo viên" />
            </Card>
            <Card>
                <StatBlock value={String(studentCount)} label="Học viên" />
            </Card>
            <Card>
                <StatBlock value={String(blogPosts.length)} label="Bài viết blog" />
            </Card>
        </div>
    );
}

export default StatsOverview;
