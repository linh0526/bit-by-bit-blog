import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Share2, Heart } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fetch target post
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post || post.category?.includes('[HIDDEN]') || post.tags?.some((t: string) => t.includes('[HIDDEN]'))) {
    return notFound();
  }

  // Fetch latest posts for right sidebar
  const { data: latestPosts } = await supabase
    .from('posts')
    .select('title, slug, created_at, category, image_url')
    .not('category', 'ilike', '[HIDDEN]%')
    .gte('priority', 0)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  // Function to slugify heading text for anchors
  const slugify = (text: string) => 
    text.toLowerCase()
      .trim()
      .normalize('NFD')                     // Normalize unique characters
      .replace(/[\u0300-\u036f]/g, '')     // Remove diacritics
      .replace(/\s+/g, '-')                // Replace spaces with -
      .replace(/[^\w-]/g, '');             // Remove non-word chars

  // Parse headings from content (Markdown ##, ### or ####)
  const headings = (post.content || "").match(/^#{2,4}\s+(.*)/gm)?.map((h: string) => {
    const level = h.startsWith('####') ? 4 : h.startsWith('###') ? 3 : 2;
    const text = h.replace(/^#{2,4}\s+/, '');
    return { level, text, id: slugify(text) };
  }) || [];

  // Simple render: replaces Markdown headings, links [text](url), etc.
  const renderedContent = (post.content || "")
    .replace(/^##\s+(.*)/gm, (_: any, title: string) => `<h2 id="${slugify(title)}">${title}</h2>`)
    .replace(/^###\s+(.*)/gm, (_: any, title: string) => `<h3 id="${slugify(title)}">${title}</h3>`)
    .replace(/^####\s+(.*)/gm, (_: any, title: string) => `<h4 id="${slugify(title)}">${title}</h4>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 1rem; margin: 2rem 0; display: block;" />')
    .replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align: center;">$1</div>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="content-link">$1</a>')
    .replace(/^\s*-\s+(.*)/gm, '<li style="margin-left: 1.5rem;">$1</li>')
    .split(/\n+/)
    .filter((para: string) => para.trim())
    .map((para: string) => {
      if (para.startsWith('<h') || para.startsWith('<li') || para.startsWith('<div')) return para;
      return `<p>${para}</p>`;
    })
    .join('');

  return (
    <div className="blog-post-page-root">
      <div className="three-column-layout">
        
        {/* LEFT COLUMN: Black Background, STICKY TOC */}
        <aside className="sidebar-column left-sidebar animate-in">
           <div className="sticky-content-toc">
              {headings.length > 0 && (
                <div className="sidebar-widget">
                  <h3 className="widget-label-white-bold">MỤC LỤC</h3>
                  <ul className="toc-nav">
                    {headings.map((h: any, i: number) => (
                      <li key={i} className={`toc-item level-${h.level}`}>
                        <a href={`#${h.id}`}>{h.text}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
           </div>
        </aside>

        {/* CENTER COLUMN: Main Content */}
        <main className="article-column animate-in">
          <header className="article-header">
            {slug !== 'about' && (
              <div className="meta-overline">
                <span className="cat-chip">{post.category}</span>
                <span className="dot">•</span>
                <span className="date-text">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            <h1 className="article-title">{post.title}</h1>
            {post.excerpt && <p className="article-excerpt-lead">{post.excerpt}</p>}
          </header>

          <div className="article-body selection-fix">
            <article className="markdown-body selection-fix font-lora" dangerouslySetInnerHTML={{ __html: renderedContent }} />
            
            {post.tags && post.tags.length > 0 && (
              <div className="article-footer-tags">
                <span className="tags-label">CHỦ ĐỀ:</span>
                {post.tags.map((tag: string) => (
                  <span key={tag} className="tag-chip-outline">#{tag}</span>
                ))}
              </div>
            )}

            <div className="actions-footer">
               <button className="like-btn"><Heart size={18} /> <span>{Math.floor(Math.random() * 100) + 20}</span></button>
               <button className="share-btn"><Share2 size={18} /> <span>Chia sẻ bài viết</span></button>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Shared Sidebar Component */}
        <Sidebar 
          latestPosts={latestPosts || []} 
          supabaseUrl={supabaseUrl} 
          isAboutPage={slug === 'about'} 
        />

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');

        html { scroll-behavior: smooth; }

        .blog-post-page-root {
          font-family: 'Be Vietnam Pro', sans-serif;
          background-color: #ffffff;
          min-height: 100vh;
          color: #000000;
          -webkit-font-smoothing: antialiased;
        }

        .three-column-layout {
          display: grid;
          grid-template-columns: 320px 1fr 340px;
          min-height: 100vh;
        }

        .sidebar-column {
          background-color: #000000;
          color: #ffffff;
          padding: 6rem 2.5rem;
        }
        .sticky-content-toc { position: sticky; top: 5rem; }
        
        .widget-label-white-bold { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.15rem; color: #ffffff; margin-bottom: 2rem; text-transform: uppercase; }
        
        .toc-nav { list-style: none; padding: 0; }
        .toc-item { margin-bottom: 1rem; }
        .toc-item.level-3 { padding-left: 1.5rem; opacity: 0.8; }
        .toc-item.level-4 { padding-left: 2.5rem; opacity: 0.6; font-size: 0.75rem !important; }
        .toc-item a { color: #ffffff; text-decoration: none; font-size: 0.85rem; font-weight: 400; transition: all 0.2s; line-height: 1.6; display: block; }
        .toc-item a:hover { color: #aaaaaa; transform: translateX(5px); }

        .article-column { padding: 6rem 4.5rem; max-width: 900px; margin: 0 auto; }
        
        .meta-overline { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #888; }
        .cat-chip { background: #000; color: #fff; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.65rem; }
        .dot { opacity: 0.3; }

        .article-title { font-size: 3.5rem; font-weight: 900; letter-spacing: -0.05em; line-height: 1.1; margin-bottom: 2rem; }
        .tag-chip-outline { font-size: 0.8rem; font-weight: 700; color: #9333ea; border: 1px solid rgba(147, 51, 234, 0.2); padding: 0.25rem 0.8rem; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; }
        .tag-chip-outline:hover { background: rgba(147, 51, 234, 0.05); }
        .article-footer-tags { margin-top: 4rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .tags-label { font-size: 0.75rem; font-weight: 900; color: #bbb; letter-spacing: 0.1em; }
        .article-excerpt-lead { font-size: 1.5rem; line-height: 1.6; color: #666; font-weight: 400; margin-bottom: 5rem; border-left: 3px solid #eee; padding-left: 2rem; }

        .font-lora { font-family: 'Lora', serif !important; }

        .markdown-body { font-size: 1.35rem; line-height: 1.85; color: #222; }
        .markdown-body h2 { font-family: 'Be Vietnam Pro', sans-serif; font-size: 2.25rem; font-weight: 900; margin: 5rem 0 1.5rem; letter-spacing: -0.02em; border-left: 5px solid #000; padding-left: 1.5rem; scroll-margin-top: 6rem; }
        .markdown-body h3 { font-family: 'Be Vietnam Pro', sans-serif; font-size: 1.75rem; font-weight: 800; margin: 3rem 0 1rem; scroll-margin-top: 6rem; }
        .markdown-body h4 { font-family: 'Be Vietnam Pro', sans-serif; font-size: 1.4rem; font-weight: 700; margin: 2rem 0 0.75rem; scroll-margin-top: 6rem; }
        .markdown-body p { margin-bottom: 1.5rem; }

        .actions-footer { margin-top: 8rem; padding-top: 3rem; border-top: 1px solid #eee; display: flex; gap: 3rem; }
        .like-btn, .share-btn { font-family: 'Be Vietnam Pro', sans-serif; display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #888; border: none; background: none; cursor: pointer; }

        .selection-fix, .selection-fix * { user-select: text !important; -webkit-user-select: text !important; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-in-right { animation: fadeIn 1s ease-out forwards; }

        @media (max-width: 1400px) { .three-column-layout { grid-template-columns: 280px 1fr 300px; } }
        @media (max-width: 1100px) {
          .three-column-layout { grid-template-columns: 1fr; }
          .left-sidebar { display: none; }
          .article-column { padding: 4rem 2rem; }
        }
      `}} />
    </div>
  );
}
