import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import useBrandName from "../services/useBrandName";
import PageBanner from "../components/ui/PageBanner";
import BlogCard from "../components/ui/BlogCard";
import MiniCta from "../components/ui/MiniCta";
import usePublicPosts from "../services/usePublicPosts";
import "./Blog.css";

export default function Blog() {
  const brand = useBrandName();
  const blogPosts = usePublicPosts();
  const blogCategories = useMemo(
    () => Array.from(new Set(blogPosts.map((p) => p.category))),
    [blogPosts],
  );
  const [params, setParams] = useSearchParams();
  const requestedCategory = params.get("category");
  const activeCategory = requestedCategory && blogCategories.includes(requestedCategory) ? requestedCategory : "all";
  function setActiveCategory(category: string) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (category === "all") next.delete("category"); else next.set("category", category);
      return next;
    });
  }

  const filtered =
    activeCategory === "all"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <PageShell>
      <PageBanner
        kicker="Tin tức"
        title={`Blog ${brand}`}
        description="Tips luyện thi, kinh nghiệm học tiếng Anh và cập nhật từ đội ngũ giảng dạy."
      />
      <div className="container blog-list">
        <div className="pill-tabs blog-list__tabs">
          <button
            type="button"
            aria-pressed={activeCategory === "all"}
            className={activeCategory === "all" ? "is-active" : ""}
            onClick={() => setActiveCategory("all")}
          >
            Tất cả bài viết
          </button>
          {blogCategories.map((cat) => (
            <button
              key={cat}
              aria-pressed={activeCategory === cat}
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
