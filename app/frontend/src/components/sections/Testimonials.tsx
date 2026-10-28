import SectionHeading from "../ui/SectionHeading";
import TestimonialCard from "../ui/TestimonialCard";
import { reviews } from "../../data/reviews";
import "./Testimonials.css";

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <SectionHeading
          kicker="Học viên nói gì"
          title="Được đánh giá cao bởi hàng ngàn học viên"
        />
      </div>

      <div className="testimonials__rail">
        {reviews.map((review) => (
          <TestimonialCard review={review} key={review.review_id} />
        ))}
      </div>
    </section>
  );
}
