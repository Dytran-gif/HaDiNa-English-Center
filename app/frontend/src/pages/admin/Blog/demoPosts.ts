import { blogPosts } from "../../../data/blogPosts";
import type { DemoPost, DemoPostInput, DemoPostPage, PostQuery } from "./postTypes";
const storageKey = "admin_blog_v2";
function object(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
export function localDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
export function safeCover(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (/^\/uploads\/[a-z0-9/_.-]+$/i.test(value)) return value;
  try { const url = new URL(value); return ["http:","https:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export function normalizePost(value: unknown): DemoPost | null {
  if (!object(value)) return null;
  const id = value.id ?? value.post_id;
  if (!Number.isSafeInteger(id) || Number(id) < 1 || typeof value.title !== "string") return null;
  const date = value.publishedAt ?? value.published_at;
  const publishedAt = typeof date === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) && !Number.isNaN(Date.parse(date.slice(0,10))) ? date.slice(0,10) : null;
  const status = value.status === "Draft" ? "Draft" : value.status === "Published" || publishedAt ? "Published" : "Draft";
  const content = Array.isArray(value.content) ? value.content.filter((item): item is string => typeof item === "string") : typeof value.content === "string" ? value.content.split(/\n\s*\n/) : [];
  return { id: Number(id), title: value.title, content, status, publishedAt: status === "Published" ? publishedAt : null,
    thumbnailUrl: safeCover(value.thumbnailUrl), legacyCategory: typeof value.legacyCategory === "string" ? value.legacyCategory : typeof value.category === "string" ? value.category : null };
}
export function readDemoPosts(): DemoPost[] {
  let raw: string | null;
  try { raw = localStorage.getItem(storageKey) ?? localStorage.getItem("admin_blog"); }
  catch { throw new Error("Trình duyệt không cho phép đọc dữ liệu minh họa. Hãy kiểm tra quyền lưu trữ."); }
  if (raw === null) return blogPosts.map(normalizePost).filter((post): post is DemoPost => post !== null);
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("Dữ liệu bài viết minh họa không đọc được. Bản lưu cũ vẫn được giữ nguyên."); }
  if (!Array.isArray(parsed)) throw new Error("Dữ liệu bài viết minh họa không đúng định dạng.");
  const posts = parsed.map(normalizePost);
  if (posts.some(post => post === null) || new Set(posts.map(post => post?.id)).size !== posts.length) throw new Error("Bản lưu bài viết có dòng không hợp lệ hoặc trùng mã. Không tự ghi đè dữ liệu.");
  return posts.filter((post): post is DemoPost => post !== null);
}
function persist(posts: DemoPost[]) {
  try { localStorage.setItem(storageKey, JSON.stringify(posts)); }
  catch { throw new Error("Không lưu được thay đổi trên trình duyệt. Dung lượng có thể đã đầy; dữ liệu chưa bị thay đổi."); }
}
export async function listDemoPosts(query: PostQuery): Promise<DemoPostPage> {
  const keyword = query.search.trim().toLocaleLowerCase("vi-VN");
  const posts = readDemoPosts().filter(post => (!keyword || post.title.toLocaleLowerCase("vi-VN").includes(keyword)) && (!query.status || post.status === query.status));
  posts.sort((a,b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || b.id-a.id);
  const pageSize = Math.max(1, Math.min(100, query.pageSize));
  const page = Math.max(1, Math.min(Math.floor(query.page) || 1, Math.max(1,Math.ceil(posts.length/pageSize))));
  return { items: posts.slice((page-1)*pageSize,page*pageSize), total: posts.length, page, pageSize };
}
export async function deleteDemoPost(id: number) {
  const posts = readDemoPosts();
  if (!posts.some(post => post.id === id)) throw new Error("Không tìm thấy bài viết minh họa này. Hãy tải lại danh sách.");
  persist(posts.filter(post => post.id !== id));
}
export async function saveDemoPost(id: number | null, input: DemoPostInput): Promise<DemoPost> {
  if (!input.title.trim() || input.title.trim().length > 250) throw new Error("Tiêu đề bắt buộc và tối đa 250 ký tự.");
  if (input.status === "Published" && !input.content.some(part => part.trim())) throw new Error("Nội dung không được để trống khi đăng bài.");
  const posts = readDemoPosts(); const old = posts.find(post => post.id === id);
  if (id !== null && !old) throw new Error("Không tìm thấy bài viết minh họa này.");
  const post: DemoPost = { id: id ?? posts.reduce((max,item) => Math.max(max,item.id),0)+1, title: input.title.trim(), content: input.content,
    status: input.status, publishedAt: input.status === "Published" ? old?.publishedAt ?? localDate() : null,
    thumbnailUrl: old?.thumbnailUrl ?? null, legacyCategory: old?.legacyCategory ?? null };
  if (!Number.isSafeInteger(post.id)) throw new Error("Không tạo được mã bài viết an toàn. Dữ liệu chưa bị thay đổi.");
  persist(old ? posts.map(item => item.id === id ? post : item) : [...posts,post]);
  return post;
}
