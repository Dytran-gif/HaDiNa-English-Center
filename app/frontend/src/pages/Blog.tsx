import { useMemo, useState } from "react";
import PageShell from "../components/layout/PageShell";
import PageBanner from "../components/ui/PageBanner";
import BlogCard from "../components/ui/BlogCard";
import MiniCta from "../components/ui/MiniCta";
import { blogPosts } from "../data/blogPosts";
import "./Blog.css";

export default function Blog() {
  const blogCategories = useMemo(
    () => Array.from(new Set(blogPosts.map((p) => p.category))),
    [],
  );
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const filtered =
    activeCategory === "all"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <PageShell>
      <PageBanner
        kicker="Tin tức"
        title="Blog Happy IELTS"
        description="Tips luyện thi, kinh nghiệm học tiếng Anh và cập nhật từ đội ngũ giảng dạy."
      />
      <div className="container blog-list">
        <div className="pill-tabs blog-list__tabs">
          <button
            type="button"
            className={activeCategory === "all" ? "is-active" : ""}
            onClick={() => setActiveCategory("all")}
          >
            Tất cả bài viết
          </button>
          {blogCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={activeCategory === cat ? "is-active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="blog-list__grid">
          {filtered.map((post) => (
            <BlogCard post={post} key={post.post_id} />
          ))}
        </div>

        <MiniCta />
      </div>
    </PageShell>
  );
}
