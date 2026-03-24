import { Search } from "lucide-react";
import React, { Suspense } from "react";
import UserStatus from "./components/UserStatus";
import Link from "next/link";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import SearchInput from "./components/SearchInput";
import Sidebar from "./components/Sidebar";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore); // Use for auth
  const adminSupabase = createAdminClient(); // Use for fast public data
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Sidebar data ONCE for all pages
  const [latestResult, topResult, statsResult, postsForTagsResult] = await Promise.all([
    adminSupabase.from('posts')
      .select('id, title, slug, created_at, category, image_url, likes_count, views_count')
      .not('category', 'ilike', '[HIDDEN]%').gte('priority', 0).order('created_at', { ascending: false }).limit(5),
    adminSupabase.from('posts')
      .select('id, title, slug, created_at, category, image_url, likes_count, views_count')
      .not('category', 'ilike', '[HIDDEN]%').gte('priority', 0).order('likes_count', { ascending: false }).limit(5),
    adminSupabase.from('site_stats').select('value').eq('key', 'total_views').single(),
    adminSupabase.from('posts').select('category, tags').not('category', 'ilike', '[HIDDEN]%')
  ]);

  const latestPosts = latestResult.data || [];
  const topPosts = topResult.data || [];
  const statsData = statsResult.data;
  
  // Extract unique tags and categories directly from posts for 100% accuracy
  const tagSet = new Set<string>();
  postsForTagsResult.data?.forEach(p => {
    if (p.category && !p.category.includes('[HIDDEN]')) tagSet.add(p.category);
    p.tags?.forEach((t: string) => {
      if (!t.includes('[HIDDEN]')) tagSet.add(t);
    });
  });
  const allTags = Array.from(tagSet).sort();

  return (
    <div className="layout-root">
      <header className="header fixed-top">
        <div className="top-loading-bar" />
        <nav className="nav header-grid">
          <div className="header-left">
            <Link href="/" className="logo">
              <span className="logo-bit">bitbybit</span>
              <span className="logo-separator">/</span>
              <span className="logo-bit">with_linh</span>
            </Link>
          </div>
          <div className="header-center">
            <div className="nav-links">
              <Link href="/" className="nav-link">BLOG</Link>
              <Link href="/about" className="nav-link">ABOUT</Link>
            </div>
          </div>
          <div className="header-right">
            <Suspense fallback={<div className="search-placeholder" />}>
              <SearchInput />
            </Suspense>
            <UserStatus initialUser={user} />
          </div>
        </nav>
      </header>

      <div className="three-column-layout">
        {/* The first two columns are provided by the children (Home or Post) */}
        {children}

        {/* Persistent Right Sidebar - Column 3 */}
        <Sidebar 
          latestPosts={latestPosts} 
          topPosts={topPosts}
          allTags={allTags}
          totalViews={statsData?.value || 0}
        />
      </div>

      <footer className="footer container">
        <p className="copyright">© {new Date().getFullYear()} Bit-by-Bit / with Linh</p>
        <div className="social">
          <span className="social-item">Github</span>
          <span className="social-item">LinkedIn</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0.8rem 0;
          background-color: #000000; /* Black bg */
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .header-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          width: 100%;
          padding: 0 2.5rem;
        }
        .header-left { display: flex; justify-content: flex-start; }
        .header-center { display: flex; justify-content: center; }
        .header-right { 
          display: flex; 
          justify-content: flex-end; 
          gap: 1rem;
          align-items: center;
        }
        .search-placeholder { 
          width: 140px; 
          height: 32px; 
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
        }

        @media (max-width: 1024px) {
          .header-grid {
            grid-template-columns: 1fr auto;
            padding: 0 1rem;
          }
          .header-center { display: none; }
          .logo { font-size: 1rem; }
          .search-placeholder { width: 100px; }
        }

        @media (max-width: 480px) {
           .logo { font-size: 0.85rem; }
           .logo-separator { margin: 0 0.15rem; }
        }

        .logo {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          text-transform: uppercase;
          color: #ffffff;
        }
        .logo-separator {
          margin: 0 0.5rem;
          opacity: 0.3;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #ffffff;
          opacity: 0.7;
          transition: all 0.2s;
        }
        .nav-link:hover {
          opacity: 1;
          color: #ffffff;
          transform: translateY(-1px);
        }
        .top-loading-bar {
          position: absolute;
          top: 0; left: 0;
          height: 3px;
          background: linear-gradient(to right, #9333ea, #3b82f6);
          width: 100%;
          animation: loadProgress 2s ease-in-out forwards;
          z-index: 1001;
        }
        @keyframes loadProgress {
          0% { transform: scaleX(0); transform-origin: left; }
          70% { transform: scaleX(0.9); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; opacity: 0; }
        }

        .main-content {
          flex-grow: 1;
        }
        .footer {
          padding: 0.8rem 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #111;
          opacity: 1;
          font-size: 0.8125rem;
          background-color: #000000;
          color: #666;
          position: relative;
        }
        @media (max-width: 600px) {
          .footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 2rem 0;
          }
        }
        .social {
          display: flex;
          gap: 1.5rem;
        }
      `}} />
    </div>
  );
}
