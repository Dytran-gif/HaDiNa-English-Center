import SectionHeading from "../ui/SectionHeading";
import BlogCard from "../ui/BlogCard";
import Button from "../ui/Button";
import { blogPosts } from "../../data/blogPosts";
import "./NewsBlog.css";

export default function NewsBlog() {
  const featured = blogPosts.slice(0, 3);

  return (
    <section className="news-blog">
      <div className="container">
        <div className="news-blog__head">
          <SectionHeading kicker="Tin tức" title="Tin tức & Blogs" />
          <Button to="/blog" variant="outline">
            Xem thêm
          </Button>
        </div>

        <div className="news-blog__grid">
          {featured.map((post) => (
            <BlogCard post={post} key={post.post_id} />
          ))}
        </div>
      </div>
    </section>
  );
}
