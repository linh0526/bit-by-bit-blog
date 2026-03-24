import { createAdminClient } from "@/utils/supabase/server";
import BlogFeed from "../../components/BlogFeed";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const adminSupabase = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fetch initial posts filtered by tag
  const { data: initialPosts } = await adminSupabase
    .from('posts')
    .select('id, title, slug, excerpt, created_at, category, image_url, views_count, likes_count, image_alt, priority, tags')
    .contains('tags', [decodedTag])
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <main className="feed-column-home animate-in">
      <header className="collection-header">
        <h1 className="collection-title">
          Tag: <span className="collection-name">#{decodedTag}</span>
        </h1>
      </header>
      
      <BlogFeed 
        initialPosts={initialPosts || []} 
        filterTag={decodedTag} 
        supabaseUrl={supabaseUrl} 
      />
    </main>
  );
}
