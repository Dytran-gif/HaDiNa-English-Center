import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import MiniCta from "../components/ui/MiniCta";
import BlogCard from "../components/ui/BlogCard";
import { getBlogPostBySlug, blogPosts } from "../data/blogPosts";
import NotFound from "./NotFound";
import "./BlogDetail.css";

const formatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function BlogDetail() {
  const { slug = "" } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return <NotFound />;
  }

  const related = blogPosts
    .filter((p) => p.category === post.category && p.post_id !== post.post_id)
    .slice(0, 2);

  return (
    <PageShell>
      <article className="container blog-detail">
        <Button to="/blog" variant="ghost" className="blog-detail__back">
          ← Tất cả bài viết
        </Button>

        <div className="blog-detail__meta">
          <Tag>{post.category}</Tag>
          <time dateTime={post.published_at}>
            {formatter.format(new Date(post.published_at))}
          </time>
        </div>

        <h1>{post.title}</h1>

        <div className="blog-detail__body">
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <MiniCta />

        {related.length > 0 && (
          <div className="blog-detail__related">
            <h2>Bài viết liên quan</h2>
            <div className="blog-detail__related-grid">
              {related.map((p) => (
                <BlogCard post={p} key={p.post_id} />
              ))}
            </div>
          </div>
        )}
      </article>
    </PageShell>
  );
}
