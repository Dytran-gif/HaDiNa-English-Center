import { useState } from "react";
import type { Review } from "../../types";
import Tag from "./Tag";
import "./TestimonialCard.css";

interface TestimonialCardProps {
  review: Review;
}

export default function TestimonialCard({ review }: TestimonialCardProps) {
  const [expanded, setExpanded] = useState(false);
  const long = review.comment.length > 220;
  const date = review.created_at ? new Date(review.created_at).toLocaleDateString("vi-VN") : "";

  return (
    <article className="testimonial-card">
      <div className="testimonial-card__top">
        <Tag tone="yellow">{review.band_score ? `IELTS ${review.band_score}` : review.course_name ?? "Học viên"}</Tag>
        <span className="testimonial-card__stars" aria-label={`${review.rating} trên 5 sao`}>
          {"★".repeat(review.rating)}<span className="testimonial-card__stars-off">{"★".repeat(5 - review.rating)}</span>
        </span>
      </div>
      <p className={`testimonial-card__quote ${expanded ? "" : "testimonial-card__quote--clamped"}`}>
        “{review.comment}”
      </p>
      {long && (
        <button type="button" className="testimonial-card__toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Thu gọn" : "Đọc thêm"}
        </button>
      )}
      {/* Ai đánh giá: tên (viết tắt) + lớp + giáo viên được đánh giá + ngày */}
      <footer className="testimonial-card__author">
        <strong>{review.author_name}</strong>
        <span className="testimonial-card__meta">
          {review.class_code ? `Học viên lớp ${review.class_code}` : "Học viên"}
          {review.teacher_name ? ` · đánh giá GV ${review.teacher_name}` : ""}
          {date ? ` · ${date}` : ""}
        </span>
      </footer>
    </article>
  );
}
