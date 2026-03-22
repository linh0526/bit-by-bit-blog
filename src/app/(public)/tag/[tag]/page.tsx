import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import BlogFeed from "../../components/BlogFeed";
import Sidebar from "../../components/Sidebar";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fetch initial posts filtered by tag
  const { data: initialPosts } = await supabase
    .from('posts')
    .select('*')
    .contains('tags', [decodedTag])
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch latest posts for right sidebar (unfiltered)
  const { data: latestPosts } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, category, image_url, likes_count')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch total views for the site
  const { data: statsData } = await supabase
    .from('site_stats')
    .select('value')
    .eq('key', 'total_views')
    .single();

  return (
    <div className="home-page-root blog-style-layout">
      <div className="three-column-layout">
        
        {/* LEFT COLUMN: Hidden on Tag Page */}
        <aside className="sidebar-column left-sidebar hidden-on-home">
           <div className="sticky-content-toc"></div>
        </aside>

        {/* CENTER COLUMN: Blog Feed */}
        <main className="article-column feed-column animate-in">
          <header className="tag-header">
            <h1 className="tag-page-title">
              Tag: <span className="tag-name">#{decodedTag}</span>
            </h1>
          </header>
          <BlogFeed initialPosts={initialPosts || []} filterTag={decodedTag} />
        </main>

        {/* RIGHT COLUMN: Sidebar with widgets */}
        <Sidebar 
          latestPosts={latestPosts || []} 
          supabaseUrl={supabaseUrl} 
          totalViews={statsData?.value} 
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
        
        .tag-header { margin-bottom: 5rem; border-bottom: 1px solid #eee; padding-bottom: 2rem; }
        .tag-page-title { font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 0.5rem; color: #888; }
        .tag-name { color: #000; }
        .tag-result-count { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #bbb; letter-spacing: 0.1em; }

        .animated-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }

        @media (max-width: 1400px) { .three-column-layout { grid-template-columns: 1fr 300px; } }
        @media (max-width: 1100px) {
          .three-column-layout { grid-template-columns: 1fr; }
          .article-column { padding: 4rem 2rem; }
        }
      `}} />
    </div>
  );
}
