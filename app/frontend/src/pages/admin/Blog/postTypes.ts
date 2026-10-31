export interface DemoPost {
  id: number;
  title: string;
  content: string[];
  thumbnailUrl: string | null;
  status: "Draft" | "Published";
  publishedAt: string | null;
  legacyCategory: string | null;
}
export interface PostQuery { page: number; pageSize: number; search: string; status: string }
export interface DemoPostPage { items: DemoPost[]; total: number; page: number; pageSize: number }
export type DemoPostInput = Pick<DemoPost, "title" | "content" | "status">;
