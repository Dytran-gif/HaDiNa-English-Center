import SectionHeading from "../ui/SectionHeading";
import TestimonialCard from "../ui/TestimonialCard";
import { reviews as sampleReviews } from "../../data/reviews";
import usePublicReviews from "../../services/usePublicReviews";
import "./Testimonials.css";

export default function Testimonials() {
  // Đánh giá thật đã duyệt; DB chưa có đánh giá nào thì giữ các cảm nhận mẫu
  const { reviews: live, loading } = usePublicReviews(undefined, 12);
  const reviews = live.length > 0 ? live : loading ? [] : sampleReviews;
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
