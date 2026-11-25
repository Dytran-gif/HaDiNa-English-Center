import { useEffect, useState } from "react";
import { request } from "./apiClient";
import type { Review } from "../types";

// GET /api/public/reviews?teacherSlug=&limit= — đánh giá giáo viên đã được Admin duyệt (kèm tên viết tắt người đánh giá)
export default function usePublicReviews(teacherSlug?: string, limit = 12) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const q = new URLSearchParams({ limit: String(limit) });
    if (teacherSlug) q.set("teacherSlug", teacherSlug);
    setLoading(true); setError("");
    request<Review[]>(`/api/public/reviews?${q}`, null, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setReviews(data); })
      .catch(reason => { if (!controller.signal.aborted) { setReviews([]); setError(reason instanceof Error ? reason.message : "Không tải được đánh giá."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [teacherSlug, limit]);
  return { reviews, loading, error };
}
