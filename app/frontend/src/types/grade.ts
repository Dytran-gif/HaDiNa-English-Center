export interface Grade {
  grade_id: number;
  course_id: number;
  user_id: number;
  skill: string;
  score: number;
  note?: string;
  graded_at: string;
}
