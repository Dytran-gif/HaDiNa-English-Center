import PageShell from "../components/layout/PageShell";
import useBrandName from "../services/useBrandName";
import PageBanner from "../components/ui/PageBanner";
import TeacherCard from "../components/ui/TeacherCard";
import usePublicTeachers from "../services/usePublicTeachers";
import TeacherLoadState from "../components/ui/TeacherLoadState";
import "./Teachers.css";

export default function Teachers() {
  const brand = useBrandName();
  const { teachers, loading, error, reload } = usePublicTeachers();
  return (
    <PageShell>
      <PageBanner
        kicker="Đội ngũ giảng dạy"
        title={`Giáo viên tại ${brand}`}
        description="Đội ngũ giáo viên chuyên môn cao, đồng hành sát sao cùng học viên trong suốt lộ trình."
      />
      <div className="container teachers-grid">
        <TeacherLoadState loading={loading} error={error} empty={!teachers.length} reload={reload}/>
          {teachers.map((t) => (
          <TeacherCard teacher={t} key={t.teacher_id} />
        ))}
      </div>
    </PageShell>
  );
}
