import { useEffect, useState } from "react";
import { blogPosts as seeds } from "../data/blogPosts";
import { readDemoPosts } from "../pages/admin/Blog/demoPosts";
import type { BlogPost } from "../types";

export function readPublicPosts(): BlogPost[] {
  if (typeof localStorage === "undefined") return seeds;
  try {
    return readDemoPosts().filter(post => post.status === "Published" && post.publishedAt).map(post => {
      const seed = seeds.find(item => item.post_id === post.id);
      return {
        post_id: post.id, slug: seed?.slug ?? `bai-viet-${post.id}`, title: post.title,
        category: post.legacyCategory ?? "Tin tức", published_at: post.publishedAt!,
        excerpt: post.content[0]?.slice(0, 180) ?? "", content: post.content,
        thumbnailUrl: post.thumbnailUrl,
      };
    }).sort((a, b) => b.published_at.localeCompare(a.published_at) || b.post_id - a.post_id);
  } catch { return []; }
}

export default function usePublicPosts() {
  const [posts, setPosts] = useState(readPublicPosts);
  useEffect(() => {
    const refresh = () => setPosts(readPublicPosts());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("admin-blog-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("admin-blog-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return posts;
}
