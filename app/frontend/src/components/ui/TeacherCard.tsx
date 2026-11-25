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
      {teacher.avatar ? (
        <img
          src={teacher.avatar}
          alt={teacher.full_name}
          className="teacher-card__avatar"
        />
      ) : (
        <InitialsBlock initials={teacher.initials} size="lg" tone="green" />
      )}

      <div className="teacher-card__body">
        <h3 className="teacher-card__name">{teacher.full_name}</h3>
        <p className="teacher-card__title">{teacher.title}</p>
        {teacher.rating != null && (
          <p className="teacher-card__rating">★ {teacher.rating.toFixed(1)} · {teacher.review_count} đánh giá</p>
        )}
        <Button to={`/giao-vien/${teacher.slug}`} variant="ghost">
          Xem hồ sơ →
        </Button>
      </div>
    </article>
  );
}