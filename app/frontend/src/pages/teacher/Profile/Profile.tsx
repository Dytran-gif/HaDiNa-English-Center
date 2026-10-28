import Card from "../../../components/ui/Card";
import Tag from "../../../components/ui/Tag";
import { getCurrentTeacher } from "../../../data/TeacherData/currentTeacher";

export default function Profile() {
    const teacher = getCurrentTeacher();

    return (
        <Card className="teacher-profile-card" style={{ maxWidth: 480 }}>
            <h2>{teacher.full_name}</h2>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>{teacher.title}</p>
            <p style={{ marginTop: 16 }}>{teacher.bio}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                {teacher.credentials.map((c) => (
                    <Tag key={c}>{c}</Tag>
                ))}
            </div>
        </Card>
    );
}
