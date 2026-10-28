import type { BlogPost } from "../../types";
import Tag from "./Tag";
import Button from "./Button";
import "./BlogCard.css";

interface BlogCardProps {
  post: BlogPost;
}

const formatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="blog-card">
      <div className="blog-card__top">
        <Tag>{post.category}</Tag>
        <time className="blog-card__date" dateTime={post.published_at}>
          {formatter.format(new Date(post.published_at))}
        </time>
      </div>
      <h3 className="blog-card__title">{post.title}</h3>
      <p className="blog-card__excerpt">{post.excerpt}</p>
      <Button to={`/blog/${post.slug}`} variant="ghost">
        Đọc thêm →
      </Button>
    </article>
  );
}
