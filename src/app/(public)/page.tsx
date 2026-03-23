import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import BlogFeed from "./components/BlogFeed";
import Sidebar from "./components/Sidebar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Build query for posts
  let query = supabase
    .from('posts')
    .select('*')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0);

  if (q) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const { data: initialPosts } = await query
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10); 

  // Fetch latest posts for right sidebar
  const { data: latestPosts } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, category, image_url, likes_count')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch top posts by hearts
  const { data: topPosts } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, category, image_url, likes_count')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('likes_count', { ascending: false })
    .limit(3);

  // Fetch total views for the site
  const { data: statsData } = await supabase
    .from('site_stats')
    .select('value')
    .eq('key', 'total_views')
    .single();

  // Fetch unique tags from all posts
  const { data: tagPosts } = await supabase.from('posts').select('tags').not('category', 'ilike', '[HIDDEN]%');
  const allTags = Array.from(new Set(tagPosts?.flatMap(p => p.tags || []) || []));

  return (
    <div className="home-page-root blog-style-layout">
      <div className="three-column-layout">
        
        {/* LEFT COLUMN: Hidden on Home Page */}
        <aside className="sidebar-column left-sidebar hidden-on-home">
           <div className="sticky-content-toc"></div>
        </aside>
 
        {/* CENTER COLUMN: Blog Feed */}
        <main className="article-column feed-column animate-in">
          {q && (
            <div className="search-status-bar">
              <h2 className="search-result-label">KẾT QUẢ TÌM KIẾM CHO: <span className="query-text">"{q}"</span></h2>
              <a href="/" className="clear-search-btn">XÓA TÌM KIẾM ×</a>
            </div>
          )}
          <BlogFeed initialPosts={initialPosts || []} searchQuery={q} />
          {q && initialPosts?.length === 0 && (
            <div className="no-results">
              <p>Không tìm thấy bài viết nào phù hợp với từ khóa của bạn.</p>
            </div>
          )}
        </main>
 
        {/* RIGHT COLUMN: Sidebar with widgets */}
        <Sidebar 
          latestPosts={latestPosts || []} 
          topPosts={topPosts || []}
          supabaseUrl={supabaseUrl} 
          totalViews={statsData?.value} 
          allTags={allTags}
        />

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');

        .home-page-root {
          font-family: 'Be Vietnam Pro', sans-serif;
          background-color: #ffffff;
          min-height: 100vh;
          color: #000000;
        }

        .three-column-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          min-height: 100vh;
        }

        .left-sidebar.hidden-on-home { display: none; }

        .article-column { padding: 3rem 4.5rem; max-width: 900px; margin: 0 auto; width: 100%; }
        
        .animated-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }
        
        /* SEARCH UI */
        .search-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #f0f0f0;
          animation: fadeIn 0.5s ease-out;
        }
        .search-result-label {
          font-size: 0.9rem;
          font-weight: 800;
          color: #888;
          letter-spacing: 0.1em;
        }
        .query-text {
          color: #000;
          border-bottom: 2px solid #000;
          padding: 0 0.2rem;
        }
        .clear-search-btn {
          font-size: 0.75rem;
          font-weight: 700;
          color: #9333ea;
          text-decoration: none;
          padding: 0.4rem 0.8rem;
          border: 1px solid #e9d5ff;
          border-radius: 2rem;
          transition: all 0.2s;
        }
        .clear-search-btn:hover {
          background: #f5f3ff;
          border-color: #9333ea;
        }
        .no-results {
          padding: 6rem 0;
          text-align: center;
          color: #888;
        }

        @media (max-width: 1400px) { .three-column-layout { grid-template-columns: 1fr 300px; } }
        @media (max-width: 1024px) {
          .three-column-layout { grid-template-columns: 1fr; }
          .sidebar-column { display: none; }
          .feed-column { padding: 2rem 1.5rem; border-left: none; }
        }
        @media (max-width: 1100px) {
          .three-column-layout { grid-template-columns: 1fr; }
          .article-column { padding: 4rem 2rem; }
        }
      `}} />
    </div>
  );
}
