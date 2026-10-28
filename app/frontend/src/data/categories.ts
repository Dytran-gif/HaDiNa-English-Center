import type { Category } from "../types";

export const categories: Category[] = [
  { category_id: 1, slug: "giao-tiep", category_name: "Giao tiếp" },
  { category_id: 2, slug: "ielts", category_name: "IELTS" },
  { category_id: 3, slug: "toeic", category_name: "TOEIC" },
  { category_id: 4, slug: "thieu-nhi", category_name: "Thiếu nhi" },
  { category_id: 5, slug: "sat", category_name: "SAT" },
];

export function getCategoryById(id: number): Category | undefined {
  return categories.find((c) => c.category_id === id);
}
