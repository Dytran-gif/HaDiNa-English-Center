export interface Course {
  course_id: number;
  slug: string;
  course_name: string;
  short_description: string;
  description: string;
  category_id: number;
  teacher_id: number;
  price: number;
  duration_weeks: number;
  level: string;
  schedule: string;
  outline: string[];
}
