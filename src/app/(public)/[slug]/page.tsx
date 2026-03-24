import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CommentSection from "../components/CommentSection";
import PostInteractions from "../components/PostInteractions";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, image_url, seo_title, seo_description, seo_og_image')
    .eq('slug', slug)
    .single();

  if (!post) return { title: 'Bài viết không tồn tại' };

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const imageUrl = post.seo_og_image || post.image_url || "https://feyzwofpwuutgbuglaqi.supabase.co/storage/v1/object/public/blog-images/default-og.png";

  return {
    title: `${title.replace(/\[\/?center\]/g, '')} | Bit by Bit`,
    description: (description || '').replace(/\[\/?center\]/g, ''),
    openGraph: {
      title: title.replace(/\[\/?center\]/g, ''),
      description: (description || '').replace(/\[\/?center\]/g, ''),
      images: [imageUrl],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title.replace(/\[\/?center\]/g, ''),
      description: (description || '').replace(/\[\/?center\]/g, ''),
      images: [imageUrl],
    },
  };
}

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

  // Fetch related posts (same category, different id)
  const { data: relatedPosts } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, category, image_url, likes_count')
    .eq('category', post.category)
    .neq('id', post.id)
    .not('category', 'ilike', '[HIDDEN]%')
    .limit(3);

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

  // 5. Fetch total views for the site
  const { data: statsData } = await supabase
    .from('site_stats')
    .select('value')
    .eq('key', 'total_views')
    .single();

  // Fetch unique tags from all posts
  const { data: tagPosts } = await supabase.from('posts').select('tags').not('category', 'ilike', '[HIDDEN]%');
  const allTags = Array.from(new Set(tagPosts?.flatMap(p => p.tags || []) || []));

  // Function to slugify heading text for anchors
  const slugify = (text: string) => 
    text.toLowerCase()
      .replace(/\[\/?center\]/gi, '')
      .trim()
      .normalize('NFD')                     // Normalize unique characters
      .replace(/[\u0300-\u036f]/g, '')     // Remove diacritics
      .replace(/\s+/g, '-')                // Replace spaces with -
      .replace(/[^\w-]/g, '');             // Remove non-word chars

  // Parse headings from content (Markdown ##, ### or ####)
  const headings = (post.content || "").match(/^#{2,4}\s+(.*)/gm)?.map((h: string) => {
    const level = h.startsWith('####') ? 4 : h.startsWith('###') ? 3 : 2;
    const text = h.replace(/^#{2,4}\s+/, '').replace(/\[\/?center\]/g, '');
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
    .replace(/\[center\]([\s\S]*?)\[\/center\]/g, '<div style="text-align: center;">$1</div>')
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
        <aside className="sidebar-column left-sidebar">
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
            <h1 className="article-title">{post.title.replace(/\[\/?center\]/g, '')}</h1>
            {post.excerpt && <p className="article-excerpt-lead">{post.excerpt}</p>}
          </header>

          <div className="article-body selection-fix">
            <article className="markdown-body selection-fix font-lora" dangerouslySetInnerHTML={{ __html: renderedContent }} />
            
            {post.tags && post.tags.length > 0 && (
              <div className="article-footer-tags">
                <span className="tags-label">Tags:</span>
                {post.tags.map((tag: string) => (
                  <Link href={`/tag/${tag}`} key={tag} className="tag-chip-outline">#{tag}</Link>
                ))}
              </div>
            )}

            {/* LIKES & SHARE */}
            <PostInteractions 
              postId={post.id} 
              initialLikes={post.likes_count} 
              postTitle={post.title} 
            />

            {/* RELATED POSTS SECTION */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="related-section">
                <h3 className="section-title">BÀI VIẾT TƯƠNG TỰ</h3>
                <div className="related-grid">
                  {relatedPosts.map((rp: any) => (
                    <Link href={`/${rp.slug}`} key={rp.id} className="related-card">
                      {rp.image_url && (
                        <div className="related-img-container">
                          <img src={rp.image_url} alt={rp.title} />
                        </div>
                      )}
                      <div className="related-content">
                        <div className="related-meta-row">
                          <span className="related-cat">{rp.category}</span>
                          <span className="dot">•</span>
                          <span className="related-date">{new Date(rp.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h4 className="related-title">{rp.title.replace(/\[\/?center\]/g, '')}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <CommentSection postId={post.id} />
          </div>
        </main>

        {/* RIGHT COLUMN: Sidebar with widgets */}
        <Sidebar 
          latestPosts={latestPosts || []} 
          topPosts={topPosts || []}
          supabaseUrl={supabaseUrl} 
          isAboutPage={slug === 'about'} 
          totalViews={statsData?.value} 
          postSlug={slug}
          allTags={allTags}
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
          padding: 3rem 2.5rem;
        }
        .sticky-content-toc { position: sticky; top: 5rem; }
        
        .widget-label-white-bold { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.15rem; color: #ffffff; margin-bottom: 2rem; text-transform: uppercase; }
        
        .toc-nav { list-style: none; padding: 0; }
        .toc-item { margin-bottom: 1rem; }
        .toc-item.level-3 { padding-left: 1.5rem; opacity: 0.8; }
        .toc-item.level-4 { padding-left: 2.5rem; opacity: 0.6; font-size: 0.75rem !important; }
        .toc-item a { color: #ffffff; text-decoration: none; font-size: 0.85rem; font-weight: 400; transition: all 0.2s; line-height: 1.6; display: block; }
        .toc-item a:hover { color: #aaaaaa; transform: translateX(5px); }

        .article-column { padding: 3rem 4.5rem; max-width: 900px; margin: 0 auto; }
        
        .meta-overline { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #888; }
        .cat-chip { background: #000; color: #fff; padding: 0.25rem 0.75rem; border-radius: 0.75rem; font-size: 0.65rem; }
        .dot { opacity: 0.3; }

        .article-title { font-size: 3.5rem; font-weight: 900; letter-spacing: -0.05em; line-height: 1.1; margin-bottom: 2rem; }
        .tag-chip-outline { font-size: 0.8rem; font-weight: 700; color: #9333ea; border: 1px solid rgba(147, 51, 234, 0.2); padding: 0.25rem 0.8rem; border-radius: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; }
        .tag-chip-outline:hover { background: rgba(147, 51, 234, 0.05); }
        .article-footer-tags { margin-top: 4rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .tags-label { font-size: 0.75rem; font-weight: 900; color: #bbb; letter-spacing: 0.1em; }
        .article-excerpt-lead { font-size: 1.5rem; line-height: 1.6; color: #666; font-weight: 400; margin-bottom: 2rem; border-left: 3px solid #eee; padding-left: 2rem; }

        .font-lora { font-family: 'Lora', serif !important; }

        .markdown-body { font-size: 1.35rem; line-height: 1.85; color: #222; }
        .markdown-body h2 { font-family: 'Be Vietnam Pro', sans-serif; font-size: 2.25rem; font-weight: 900; margin: 5rem 0 1.5rem; letter-spacing: -0.02em; border-left: 5px solid #000; padding-left: 1.5rem; scroll-margin-top: 6rem; }
        .markdown-body h3 { font-family: 'Be Vietnam Pro', sans-serif; font-size: 1.75rem; font-weight: 800; margin: 3rem 0 1rem; scroll-margin-top: 6rem; }
        .markdown-body h4 { font-family: 'Be Vietnam Pro', sans-serif; font-size: 1.4rem; font-weight: 700; margin: 2rem 0 0.75rem; scroll-margin-top: 6rem; }
        .markdown-body p { margin-bottom: 1.5rem; }

        .actions-footer { margin-top: 8rem; padding-top: 3rem; border-top: 1px solid #eee; display: flex; gap: 3rem; }
        .like-btn, .share-btn { font-family: 'Be Vietnam Pro', sans-serif; display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #888; border: none; background: none; cursor: pointer; }

        .selection-fix, .selection-fix * { user-select: text !important; -webkit-user-select: text !important; }

        .related-section { margin-top: 2rem; margin-bottom: 6rem; border-top: 1px solid #f0f0f0; padding-top: 5rem; }
        .related-section .section-title { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.2rem; color: #bbb; margin-bottom: 2.5rem; text-transform: uppercase; }
        .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
        .related-card { text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 1rem; transition: all 0.3s; }
        .related-img-container { width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 0.5rem; }
        .related-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .related-card:hover img { transform: scale(1.08); }
        .related-meta-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .related-cat { font-size: 0.6rem; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.1em; }
        .related-date { font-size: 0.6rem; font-weight: 600; color: #bbb; }
        .related-title { font-size: 1.05rem; font-weight: 800; line-height: 1.4; margin: 0; color: #222; }
        .related-card:hover .related-title { color: #000; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-in-right { animation: fadeIn 1s ease-out forwards; }

        @media (max-width: 1400px) { .three-column-layout { grid-template-columns: 280px 1fr 300px; } }
        @media (max-width: 1024px) {
          .three-column-layout { grid-template-columns: 1fr; }
          .sidebar-column { display: none; }
          .article-column { padding: 2rem 1.5rem; max-width: 100%; border-left: none; }
          .article-title { font-size: 2.25rem; }
          .markdown-body { font-size: 1.15rem; line-height: 1.7; }
          .markdown-body h2 { font-size: 1.75rem; border-left-width: 3px; padding-left: 1rem; margin: 3rem 0 1.25rem; }
          .markdown-body h3 { font-size: 1.4rem; }
          .article-excerpt-lead { font-size: 1.15rem; padding-left: 1rem; margin-bottom: 2rem; }
          .post-hero-image img { border-radius: 0; }
          .hero-container { margin: 0; padding: 0; }
          .related-grid { grid-template-columns: 1fr; gap: 2.5rem; }
        }

        @media (max-width: 768px) {
          .article-title { font-size: 1.75rem; }
          .post-interactions-row { flex-direction: column; align-items: stretch; gap: 1rem; }
          .like-btn, .share-btn-minimal { justify-content: center; width: 100%; }
        }

        @media (max-width: 1100px) {
          .three-column-layout { grid-template-columns: 1fr; }
          .left-sidebar { display: none; }
          .article-column { padding: 4rem 1.5rem; }
        }
      `}} />
    </div>
  );
}
