import { createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CommentSection from "../components/CommentSection";
import PostInteractions from "../components/PostInteractions";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const adminSupabase = createAdminClient();
  
  const { data: post } = await adminSupabase
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
  const adminSupabase = createAdminClient();

  // Fetch only the main post data (Sidebar is now in layout)
  const { data: post, error } = await adminSupabase.from('posts').select('*').eq('slug', slug).single();

  if (error || !post) {
    console.error(`SERVER: Post not found or error for slug: ${slug}`, error);
    return notFound();
  }

  if (post.category?.includes('[HIDDEN]') || post.tags?.some((t: string) => t.includes('[HIDDEN]'))) {
    return notFound();
  }

  // Related posts
  const { data: relatedPosts } = await adminSupabase.from('posts')
    .select('id, title, slug, created_at, category, image_url, likes_count, views_count')
    .eq('category', post.category).neq('id', post.id).not('category', 'ilike', '[HIDDEN]%').limit(3);

  const slugify = (text: string) => 
    text.toLowerCase()
      .replace(/\[\/?center\]/gi, '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  const headings = (post.content || "").match(/^#{2,4}\s+(.*)/gm)?.map((h: string) => {
    const level = h.startsWith('####') ? 4 : h.startsWith('###') ? 3 : 2;
    const text = h.replace(/^#{2,4}\s+/, '').replace(/\[\/?center\]/g, '');
    return { level, text, id: slugify(text) };
  }) || [];

  const renderedContent = (post.content || "")
    .replace(/^##\s+(.*)/gm, (_: any, title: string) => `<h2 id="${slugify(title)}">${title}</h2>`)
    .replace(/^###\s+(.*)/gm, (_: any, title: string) => `<h3 id="${slugify(title)}">${title}</h3>`)
    .replace(/^####\s+(.*)/gm, (_: any, title: string) => `<h4 id="${slugify(title)}">${title}</h4>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async" style="max-width: 100%; border-radius: 1rem; margin: 2rem 0; display: block;" />')
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .side-toc-container {
           grid-column: 1;
           position: sticky;
           top: 6rem;
           height: fit-content;
           padding: 0 2rem;
           background: transparent;
        }

        @media (max-width: 1100px) {
           .side-toc-container { display: none; }
        }

        .article-column { 
           grid-column: 2; 
           padding: 3rem 4.5rem; 
           max-width: 900px; 
           margin: 0 auto; 
        }

        @media (max-width: 1100px) {
           .article-column { grid-column: 1 / -1; padding: 2rem 1.5rem; }
        }
      `}} />

      <aside className="side-toc-container">
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
      </aside>

      <main className="article-column">
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

          <PostInteractions 
            postId={post.id} 
            initialLikes={post.likes_count} 
            postTitle={post.title} 
            viewCount={post.views_count}
          />

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
    </>
  );
}
