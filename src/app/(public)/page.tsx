import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import BlogFeed from "./components/BlogFeed";
import Sidebar from "./components/Sidebar";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fetch initial 5 posts for the feed
  const { data: initialPosts } = await supabase
    .from('posts')
    .select('*')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10); 

  // Fetch latest posts for right sidebar
  const { data: latestPosts } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, category, image_url')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="home-page-root blog-style-layout">
      <div className="three-column-layout">
        
        {/* LEFT COLUMN: Hidden on Home Page */}
        <aside className="sidebar-column left-sidebar hidden-on-home">
           <div className="sticky-content-toc"></div>
        </aside>

        {/* CENTER COLUMN: Blog Feed */}
        <main className="article-column feed-column animate-in">
          <BlogFeed initialPosts={initialPosts || []} />
        </main>

        {/* RIGHT COLUMN: Sidebar with widgets */}
        <Sidebar latestPosts={latestPosts || []} supabaseUrl={supabaseUrl} />

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

        .article-column { padding: 6rem 4.5rem; max-width: 900px; margin: 0 auto; width: 100%; }
        
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
