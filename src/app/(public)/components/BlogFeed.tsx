"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BlogFeed({ initialPosts, filterTag, searchQuery, supabaseUrl }: { initialPosts: any[], filterTag?: string, searchQuery?: string, supabaseUrl?: string }) {
  const [posts, setPosts] = useState(initialPosts.filter(p => p.priority >= 0 && !p.category?.includes('[HIDDEN]') && !p.tags?.some((t: string) => t.includes('[HIDDEN]'))));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10);
  const loader = useRef(null);
  const supabase = createClient();

  // Reset state when search query changes
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialPosts.length >= 10);
  }, [searchQuery, initialPosts]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    const from = page * 10;
    const to = from + 10 - 1;

    let query = supabase
      .from('posts')
      .select('id, title, slug, excerpt, created_at, category, image_url, views_count, likes_count, image_alt, priority, tags')
      .not('category', 'ilike', '[HIDDEN]%')
      .gte('priority', 0);

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
    }

    if (filterTag) {
      query = query.contains('tags', [filterTag]);
    }

    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data && data.length > 0) {
      const filtered = data.filter(p => !p.tags?.some((t: string) => t.includes('[HIDDEN]')));
      setPosts((prev) => [...prev, ...filtered]);
      setPage((prev) => prev + 1);
      if (data.length < 10) setHasMore(false);
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

  return (
    <div className="blog-feed">
      {posts.map((post, idx) => {
        const isPriority = idx < 2 && !searchQuery; // First 2 posts are 1/2 width
        
        return (
          <article 
            key={post.id} 
            className={`feed-post-item ${isPriority ? 'priority-layout' : 'grid-layout'} ${idx < 2 ? "" : "animate-in"}`}
          >
            {post.image_url && (
              <div className="feed-post-featured-image">
                <Link href={`/${post.slug}`}>
                  <Image 
                    src={post.image_url} 
                    alt={post.image_alt || post.title} 
                    fill
                    className="featured-img"
                    sizes={isPriority ? "(max-width: 1100px) 100vw, 550px" : "(max-width: 1100px) 50vw, 300px"}
                    priority={idx < 2}
                  />
                </Link>
              </div>
            )}
  
            <div className="feed-post-content">
              <header className="feed-post-header">
                <div className="meta-overline">
                  <span className="cat-chip">{post.category}</span>
                  <span className="dot">•</span>
                  <span className="date-text">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <h2 className="feed-post-title">
                  <Link href={`/${post.slug}`}>{post.title?.replace(/\[\/?center\]/g, '')}</Link>
                </h2>
              </header>
  
              <div className="feed-post-excerpt font-lora">
                <p>{isPriority ? post.excerpt : (post.excerpt?.slice(0, 80) + (post.excerpt?.length > 80 ? '...' : ''))}</p>
                <Link href={`/${post.slug}`} className="read-more-link">
                  {isPriority ? 'Tiếp tục đọc →' : 'Xem thêm'}
                </Link>
              </div>
            </div>
          </article>
        );
      })}
      
      {hasMore && (
        <div ref={loader} className="loading-trigger">
          <div className="spinner"></div>
          <p>Tải thêm bài viết...</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-feed { 
          width: 100%; 
          display: grid; 
          grid-template-columns: repeat(12, 1fr); 
          gap: 5rem 2.25rem; 
        }
        
        .priority-layout { 
          grid-column: span 6; 
          border-bottom: 2px solid #000;
          padding-bottom: 3rem;
          margin-bottom: 1rem;
        }
        
        .priority-layout .feed-post-title { font-size: 2rem; line-height: 1.1; margin-bottom: 1rem; }
        .priority-layout .feed-post-excerpt p { font-size: 1.1rem; color: #666; }
        
        .grid-layout { grid-column: span 3; }
        .grid-layout .feed-post-title { font-size: 1.25rem; margin-bottom: 0.75rem; line-height: 1.3; }
        .grid-layout .feed-post-excerpt p { font-size: 0.85rem; line-height: 1.6; color: #555; }
        .grid-layout .feed-post-featured-image { aspect-ratio: 16/10; margin-bottom: 1.5rem; }
        .grid-layout .read-more-link { padding: 0.3rem 1rem; font-size: 0.6rem; }

        .feed-post-item { width: 100%; display: flex; flex-direction: column; height: 100%; }
        .meta-overline { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #888; }
        .cat-chip { background: #000; color: #fff; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.6rem; }
        .dot { opacity: 0.3; }
        
        .feed-post-title { font-weight: 900; letter-spacing: -0.04em; }
        .feed-post-title a { text-decoration: none; color: #111; transition: opacity 0.2s; }
        .feed-post-title a:hover { opacity: 0.7; }
        
        .feed-post-featured-image { margin-bottom: 2rem; overflow: hidden; border-radius: 1.25rem; aspect-ratio: 16/9; position: relative; background: #f7f7f7; }
        .featured-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .feed-post-featured-image:hover .featured-img { transform: scale(1.05); }

        .feed-post-content { display: flex; flex-direction: column; flex: 1; }
        .feed-post-excerpt { display: flex; flex-direction: column; flex: 1; }
        .feed-post-excerpt p { color: #444; margin-bottom: 2rem; flex: 1; }
        .read-more-link { 
          margin-top: auto;
          align-self: flex-start;
          display: inline-block; 
          background: #000; 
          color: #fff; 
          padding: 0.6rem 1.75rem; 
          border-radius: 2rem; 
          font-size: 0.75rem; 
          font-weight: 800; 
          letter-spacing: 0.05em; 
          transition: all 0.2s; 
          text-decoration: none;
        }
        .read-more-link:hover { transform: translateY(-2px); background: #333; }

        .loading-trigger { grid-column: 1 / -1; padding: 4rem 0; text-align: center; color: #999; }
        .spinner {
          width: 2rem; height: 2rem; border: 3px solid #eee; border-top-color: #000; border-radius: 50%;
          margin: 0 auto 1rem; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }

        @media (max-width: 1024px) {
          .blog-feed { grid-template-columns: repeat(12, 1fr); gap: 4rem 2rem; }
          .priority-layout, .grid-layout { grid-column: span 6; }
          .priority-layout .feed-post-title { font-size: 2rem; }
        }

        @media (max-width: 768px) {
          .blog-feed { grid-template-columns: 1fr; }
          .priority-layout, .grid-layout { grid-column: auto; }
          .priority-layout .feed-post-title { font-size: 1.85rem; }
          .priority-layout { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        }
      `}} />
    </div>
  );
}
