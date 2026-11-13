export interface BlogPost {
  thumbnailUrl?: string | null;
  post_id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  published_at: string;
}
