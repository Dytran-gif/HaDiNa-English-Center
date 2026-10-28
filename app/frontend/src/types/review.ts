export interface Review {
  review_id: number;
  author_name: string;
  teacher_id?: number;
  course_id?: number;
  band_score: string;
  rating: number;
  comment: string;
  created_at: string;
}
