import usePublicCourses from "./usePublicCourses";

export interface PublicOpenClass {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: "Upcoming" | "Ongoing";
  teacher_name: string;
  teacher_slug?: string | null;
  seats_left: number;
  schedule: string;
}

export interface PublicCourse {
  course_id: number;
  code: string;
  slug: string;
  course_name: string;
  description: string;
  band_from: number;
  band_to: number;
  total_sessions: number;
  sessions_per_week: number;
  image: string | null;
  price: number;
  discount_percent: number;
  final_price: number;
  open_classes: PublicOpenClass[];
}

// Detail and list share one API catalog; unknown/unpublished slugs never use static fallback.
export default function usePublicCourse(slug: string) {
  const { courses, loading, error, reload } = usePublicCourses();
  return { course: courses.find(course => course.slug === slug) ?? null, loading, error, reload };
}
