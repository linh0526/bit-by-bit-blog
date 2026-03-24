import { createAdminClient } from "@/utils/supabase/server";
import BlogFeed from "./components/BlogFeed";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const adminSupabase = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Build query for posts - Optimized Selection (No cookies needed)
  let query = adminSupabase
    .from('posts')
    .select('id, title, slug, excerpt, created_at, category, image_url, views_count, likes_count, image_alt, priority, tags')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0);

  if (q) {
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  }

  // Fetch only the posts for the main column
  const { data: initialPosts } = await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

  return (
    <>
      {/* Blog Feed (Span Column 1 & 2) */}
      <main className="feed-column-home animate-in">
        {q && (
          <header className="collection-header">
            <h1 className="collection-title">
              Tìm kiếm: <span className="collection-name">{q}</span>
            </h1>
            <p className="search-result-count">Tìm thấy {initialPosts?.length || 0} kết quả</p>
          </header>
        )}
        
        <BlogFeed 
          initialPosts={initialPosts || []} 
          supabaseUrl={supabaseUrl || ''}
          searchQuery={q}
        />
      </main>
    </>
  );
}
