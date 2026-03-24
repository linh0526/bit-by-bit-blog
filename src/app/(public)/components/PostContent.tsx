import React from 'react';
import Link from "next/link";
import PostInteractions from "./PostInteractions";
import CommentSection from "./CommentSection";

interface PostContentProps {
  post: any;
  renderedContent: string;
  relatedPosts: any[];
  slug: string;
}

const PostContent: React.FC<PostContentProps> = ({ post, renderedContent, relatedPosts, slug }) => {
  return (
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
          slug={post.slug}
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
  );
};

export default PostContent;
