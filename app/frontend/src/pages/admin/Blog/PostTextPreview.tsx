import Badge from "../Components/Ui/Badge";
import type { DemoPost } from "./postTypes";
// Legacy demo content is plain text. React escapes tags/attributes instead of executing HTML.
export default function PostTextPreview({ post }: { post: DemoPost }) {
  return <article className="admin-post-preview"><Badge status={post.status}/><h2>{post.title}</h2>{post.publishedAt && <time dateTime={post.publishedAt}>{post.publishedAt.split("-").reverse().join("/")}</time>}{post.content.map((paragraph,index) => <p key={index}>{paragraph}</p>)}</article>;
}
