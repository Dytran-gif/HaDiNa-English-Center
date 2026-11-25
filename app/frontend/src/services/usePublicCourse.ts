import { useEffect, useState } from "react";
import { ApiError, request } from "./apiClient";

export interface PublicOpenClass {
  code: string;
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
  price: number;
  discount_percent: number;
  final_price: number;
  open_classes: PublicOpenClass[];
}

// GET /api/public/courses/{slug} — khóa thật trong DB + lớp đang mở (null nếu Admin chưa đặt slug trùng trang này)
export default function usePublicCourse(slug: string) {
  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    request<PublicCourse>(`/api/public/courses/${encodeURIComponent(slug)}`, null, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setCourse(data); })
      .catch(reason => { if (!controller.signal.aborted && (!(reason instanceof ApiError) || reason.status !== 0)) setCourse(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug]);
  return { course, loading };
}
