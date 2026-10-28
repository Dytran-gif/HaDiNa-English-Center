import type { Teacher } from "../../types";
import InitialsBlock from "./InitialsBlock";
import Button from "./Button";
import "./TeacherCard.css";

interface TeacherCardProps {
  teacher: Teacher;
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <article className="teacher-card">
      <InitialsBlock initials={teacher.initials} size="lg" tone="green" />
      <div className="teacher-card__body">
        <h3 className="teacher-card__name">{teacher.full_name}</h3>
        <p className="teacher-card__title">{teacher.title}</p>
        <p className="teacher-card__rating">★ {teacher.rating_avg.toFixed(1)} / 5.0</p>
        <Button to={`/giao-vien/${teacher.slug}`} variant="ghost">
          Xem hồ sơ →
        </Button>
      </div>
    </article>
  );
}
