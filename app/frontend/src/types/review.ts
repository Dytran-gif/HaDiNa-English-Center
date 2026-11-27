export interface Review {
  review_id: number;
  author_name: string;
  teacher_id?: number;
  course_id?: number;
  band_score?: string;
  rating: number;
  comment: string;
  created_at: string;
  // Đánh giá thật từ API (/api/public/reviews)
  class_name?: string;
  course_name?: string;
  teacher_name?: string;
  teacher_slug?: string | null;
}
