"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Heart, Share2 } from "lucide-react";
import Image from "next/image";

export default function BlogFeed({ initialPosts, filterTag }: { initialPosts: any[], filterTag?: string }) {
  const [posts, setPosts] = useState(initialPosts.filter(p => p.priority >= 0 && !p.category?.includes('[HIDDEN]') && !p.tags?.some((t: string) => t.includes('[HIDDEN]'))));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 5);
  const loader = useRef(null);
  const supabase = createClient();

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    const from = page * 5;
    const to = from + 5 - 1;

    let query = supabase
      .from('posts')
      .select('*')
      .gte('priority', 0);

    if (filterTag) {
      query = query.contains('tags', [filterTag]);
    }

    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data && data.length > 0) {
      const filtered = data.filter(p => !p.category?.includes('[HIDDEN]') && !p.tags?.some((t: string) => t.includes('[HIDDEN]')));
      setPosts((prev) => [...prev, ...filtered]);
      setPage((prev) => prev + 1);
      if (data.length < 5) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => observer.disconnect();
  }, [hasMore, page, loading]);

  const slugify = (text: string) => 
    text?.toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '') || '';

  const renderContent = (content: string) => {
    // Show first 4 paragraphs or so
    const paragraphs = (content || "").split(/\n+/).filter(p => p.trim());
    const snippetCount = paragraphs.length > 5 ? 5 : paragraphs.length;
    const snippet = paragraphs.slice(0, snippetCount).join('\n\n');
    
    return snippet
      .replace(/^##\s+(.*)/gm, (_: any, title: string) => `<h2>${title}</h2>`)
      .replace(/^###\s+(.*)/gm, (_: any, title: string) => `<h3>${title}</h3>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '') // Hide images in feed snippet
      .replace(/\[center\]([\s\S]*?)\[\/center\]/g, '<div style="text-align: center;">$1</div>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="content-link">$1</a>')
      .split(/\n+/)
      .map(para => {
        if (para.startsWith('<h') || para.startsWith('<li') || para.startsWith('<div')) return para;
        return `<p>${para}</p>`;
      })
      .join('');
  };

  return (
    <div className="blog-feed">
      {posts.map((post) => (
        <article key={post.id} className="feed-post-item animate-in">
          <header className="feed-post-header">
            <div className="meta-overline">
              <span className="cat-chip">{post.category}</span>
              {post.tags && post.tags.slice(0, 3).map((tag: string) => (
                <a href={`/tag/${tag}`} key={tag} className="tag-link-mini">#{tag}</a>
              ))}
              <span className="dot">•</span>
              <span className="date-text">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
              {post.likes_count > 0 && (
                <>
                  <span className="dot">•</span>
                  <span className="likes-badge"><Heart size={12} fill="#ef4444" color="#ef4444" strokeWidth={3} /> {post.likes_count}</span>
                </>
              )}
            </div>
            <h2 className="feed-post-title" style={post.title.includes('[center]') ? {textAlign: 'center'} : {}}>
              <a href={`/${post.slug}`}>{post.title.replace(/\[\/?center\]/g, '')}</a>
            </h2>
          </header>

          {post.image_url && (
            <div className="feed-post-featured-image">
              <a href={`/${post.slug}`}>
                <Image 
                  src={post.image_url} 
                  alt={post.title} 
                  fill
                  className="featured-img"
                  sizes="(max-width: 1100px) 100vw, 800px"
                  priority={posts.indexOf(post) < 2}
                />
              </a>
            </div>
          )}

          <div className="feed-post-body markdown-body font-lora">
            <div dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
            <div className="read-more-gradient-box">
               <a href={`/${post.slug}`} className="continue-reading-btn">TIẾP TỤC ĐỌC →</a>
            </div>
          </div>
        </article>
      ))}
      
      {hasMore && (
        <div ref={loader} className="loading-trigger">
          <div className="spinner"></div>
          <p>Đang tải thêm bài viết...</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-feed { width: 100%; }
        .feed-post-item { margin-bottom: 10rem; }
        .meta-overline { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #888; }
        .cat-chip { background: #000; color: #fff; padding: 0.2rem 0.6rem; border-radius: 2rem; font-size: 0.6rem; }
        .tag-link-mini { color: #9333ea; opacity: 0.6; text-decoration: none; font-size: 0.65rem; transition: opacity 0.2s; }
        .tag-link-mini:hover { opacity: 1; }
        .dot { opacity: 0.3; margin: 0 0.2rem; }
        .likes-badge { display: flex; align-items: center; gap: 0.35rem; color: #ef4444; font-weight: 800; font-size: 0.7rem; }
        
        .feed-post-title { font-size: 2.75rem; font-weight: 900; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 2rem; }
        .feed-post-title a { text-decoration: none; color: inherit; transition: opacity 0.2s; }
        .feed-post-title a:hover { opacity: 0.7; }
        
        .feed-post-featured-image { margin-bottom: 3rem; overflow: hidden; border-radius: 1rem; aspect-ratio: 16/9; position: relative; }
        .featured-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
        .feed-post-featured-image:hover .featured-img { transform: scale(1.03); }

        .font-lora { font-family: 'Lora', serif; }
        .markdown-body { font-size: 1.25rem; line-height: 1.8; color: #333; position: relative; max-height: 400px; overflow: hidden; }
        .read-more-gradient-box {
           position: absolute;
           bottom: 0; left: 0; right: 0;
           height: 120px;
           background: linear-gradient(to top, #ffffff 10%, rgba(255,255,255,0.8) 40%, transparent);
           display: flex;
           justify-content: center;
           align-items: flex-end;
           padding-bottom: 0.5rem;
        }
        .continue-reading-btn {
           background: #000;
           color: #fff;
           padding: 0.75rem 2rem;
           border-radius: 2rem;
           text-decoration: none;
           font-size: 0.8rem;
           font-weight: 800;
           letter-spacing: 0.05em;
           transition: transform 0.2s;
        }
        .continue-reading-btn:hover { transform: translateY(-2px); }

        .loading-trigger { padding: 4rem 0; text-align: center; color: #999; }
        .spinner {
          width: 2rem; height: 2rem; border: 3px solid #eee; border-top-color: #000; border-radius: 50%;
          margin: 0 auto 1rem; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }
      `}} />
    </div>
  );
}
