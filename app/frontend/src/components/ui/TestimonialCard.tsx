import { useState } from "react";
import type { Review } from "../../types";
import Tag from "./Tag";
import "./TestimonialCard.css";

interface TestimonialCardProps {
  review: Review;
}

export default function TestimonialCard({ review }: TestimonialCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="testimonial-card">
      <div className="testimonial-card__top">
        <Tag tone="yellow">IELTS {review.band_score}</Tag>
        <span className="testimonial-card__stars" aria-hidden="true">
          {"★".repeat(review.rating)}
        </span>
      </div>
      <p className={`testimonial-card__quote ${expanded ? "" : "testimonial-card__quote--clamped"}`}>
        “{review.comment}”
      </p>
      <button
        type="button"
        className="testimonial-card__toggle"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Thu gọn" : "Đọc thêm"}
      </button>
      <p className="testimonial-card__author">{review.author_name}</p>
    </article>
  );
}
