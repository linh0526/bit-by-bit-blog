import React from "react";
import Image from "next/image";
import { TrendingUp, Clock, BarChart3, Instagram, Github, Mail, Facebook, Heart } from "lucide-react";
import BlogStats from "./BlogStats";
import Link from "next/link";

interface SidebarProps {
  latestPosts?: any[];
  topPosts?: any[];
  supabaseUrl?: string;
  isAboutPage?: boolean;
  totalViews?: number;
  postSlug?: string;
  allTags?: string[];
}

export default function Sidebar({ latestPosts, topPosts, supabaseUrl, isAboutPage, totalViews, postSlug, allTags }: SidebarProps) {
  const profileImageUrl = supabaseUrl 
    ? `${supabaseUrl}/storage/v1/object/public/images/1774099534011-p4ncl14qqu.png`
    : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop";

  return (
    <aside className="sidebar-column-white-scroll right-sidebar right-sidebar-column">
      <div className="sidebar-flow-content">
        {/* Top Posts */}
        {topPosts && topPosts.length > 0 && (
          <div className="sidebar-widget">
            <h3 className="widget-label-unified">Hot nhất hôm nay</h3>
            <div className="related-mini-list-dark">
              {topPosts.map((lp: any, idx: number) => (
                <Link key={idx} href={`/${lp.slug}`} className="related-card-mini-dark">
                  {lp.image_url && (
                    <div className="mini-thumb-rounded">
                      <Image 
                        src={lp.image_url} 
                        alt={lp.title} 
                        fill
                        className="object-cover rounded-md"
                        sizes="60px"
                      />
                    </div>
                  )}
                  <div className="mini-content-col">
                    <span className="mini-title-dark">{lp.title.replace(/\[\/?center\]/g, '')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Latest Posts */}
        {latestPosts && latestPosts.length > 0 && (
          <div className="sidebar-widget">
            <h3 className="widget-label-unified"> MỚI NHẤT</h3>
            <div className="related-mini-list-dark">
              {latestPosts.map((lp: any) => (
                <Link key={lp.slug} href={`/${lp.slug}`} className="related-card-mini-dark">
                  {lp.image_url && (
                    <div className="mini-thumb-rounded">
                       <Image 
                        src={lp.image_url} 
                        alt={lp.title} 
                        fill
                        className="object-cover rounded-md"
                        sizes="60px"
                      />
                    </div>
                  )}
                  <span className="mini-title-dark">{lp.title.replace(/\[\/?center\]/g, '')}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* About Me Segment */}
        <div className="sidebar-widget">
          <h3 className="widget-label-unified">Về tui</h3>
          <div className="about-me-premium-box">
            <div className="about-me-header-row">
               <div className="profile-img-container">
                  <Image 
                   src={profileImageUrl} 
                   alt="Linh" 
                   width={40}
                   height={40}
                   className="profile-pic-mini"
                 />
               </div>
               <div className="about-me-name-col">
                  <span className="author-name-small">Nguyễn Hoài Linh</span>
                  <span className="author-role-tiny">FullStack Developer</span>
               </div>
            </div>
            <p className="about-desc-refined">
              Xin chào, mình là Hoài Linh - một developer đam mê kĩ thuật và sự tinh giản. 
              Nơi đây mình chia sẻ những kiến thức, trải nghiệm từ cuộc sống sinh viên và đồ án.
            </p>
            <div className="social-follow-row">
              <span className="follow-label">FOLLOW:</span>
              <div className="social-links-mini">
                <a href="https://www.facebook.com/hoai.linh.0507/"><Facebook size={14} /></a>
                <a href="https://github.com/linh0526"><Github size={14} /></a>
                <a href="mailto:hoailinh.vn05@gmail.com"><Mail size={14} /></a>
              </div>
            </div>
            
            {!isAboutPage && (
              <Link href="/about" className="see-more-about-btn">
                XEM CHI TIẾT <span>→</span>
              </Link>
            )}
          </div>
        </div>

        {/* BLOG STATS */}
        <div className="sidebar-widget">
          <div className="stats-header-minimal">
            <h3 className="widget-label-unified" style={{marginBottom: 0}}>Thống kê</h3>
            <BlogStats initialViews={totalViews} postSlug={postSlug} />
          </div>
        </div>

        {/* TAG CLOUD */}
        {allTags && allTags.length > 0 && (
          <div className="sidebar-widget">
             <h3 className="widget-label-unified">Tất cả TAGS</h3>
             <div className="tag-cloud-container">
                {allTags.map((tag: string, i: number) => {
                  const sizes = ['0.7rem', '0.85rem', '1.1rem', '0.65rem', '1.25rem'];
                  const size = sizes[i % sizes.length];
                  return (
                    <Link 
                      key={tag} 
                      href={`/tag/${tag}`} 
                      className="tag-cloud-link"
                      style={{ fontSize: size }}
                    >
                      #{tag}
                    </Link>
                  );
                })}
             </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .tag-cloud-container { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: baseline; }
        .tag-cloud-link { color: #888; text-decoration: none; font-weight: 800; transition: all 0.2s; letter-spacing: 0.02em; }
        .tag-cloud-link:hover { color: #000; transform: translateY(-2px); }
        .sidebar-flow-content { display: flex; flex-direction: column; }
        .sidebar-widget { margin-bottom: 5rem; }
        .stats-header-minimal { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid #f0f0f0; padding-bottom: 0.8rem; }
        
        .related-mini-list-dark { display: flex; flex-direction: column; gap: 1.5rem; }
        .related-card-mini-dark { display: flex; gap: 1.25rem; text-decoration: none; color: inherit; align-items: flex-start; }
        .mini-thumb-rounded { width: 50px; height: 50px; min-width: 50px; position: relative; border-radius: 8px; border: 1px solid #eee; overflow: hidden; background: #f9f9f9; }
        .mini-content-col { display: flex; flex-direction: column; justify-content: start; gap: 0.35rem; }
        .mini-title-dark { font-size: 0.85rem; font-weight: 700; line-height: 1.35; color: #111; transition: color 0.2s; }
        .related-card-mini-dark:hover .mini-title-dark { color: #666; }
        .stat-row { display: flex; align-items: center; gap: 0.3rem; }
        .stat-count { font-size: 0.65rem; font-weight: 800; color: #ef4444; }
        
        /* About Me Refined (Light variant) */
        .about-me-premium-box { background: #fafafa; padding: 1.75rem; border-radius: 1.25rem; border: 1px solid #f0f0f0; }
        .about-me-header-row { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.25rem; }
        .profile-pic-mini { border-radius: 0.75rem; object-fit: cover; background: #eee; }
        .about-me-name-col { display: flex; flex-direction: column; line-height: 1.25; }
        .author-name-small { font-size: 0.95rem; font-weight: 900; color: #000; }
        .author-role-tiny { font-size: 0.6rem; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .about-desc-refined { font-size: 0.75rem; line-height: 1.75; color: #555; margin-bottom: 1.5rem; transition: color 0.3s; }
        .about-me-premium-box:hover .about-desc-refined { color: #111; }
        
        .social-follow-row { display: flex; align-items: center; justify-content: space-between; padding-top: 1.25rem; border-top: 1px dashed #eee; margin-bottom: 1.25rem; }
        .follow-label { font-size: 0.6rem; font-weight: 900; color: #bbb; letter-spacing: 0.2em; }
        .social-links-mini { display: flex; gap: 0.85rem; color: #888; }
        .social-links-mini a { color: inherit; transition: all 0.2s; }
        .social-links-mini a:hover { color: #000; transform: translateY(-3px); }

        .see-more-about-btn { 
          display: block; 
          width: 100%; 
          text-align: center; 
          background: #000; 
          color: #fff; 
          padding: 0.75rem; 
          border-radius: 0.75rem; 
          font-size: 0.7rem; 
          font-weight: 900; 
          text-decoration: none; 
          letter-spacing: 0.15em;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .see-more-about-btn:hover { background: #333; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        
        .stats-box-minimal { background: #000; color: #fff; padding: 1.5rem; border-radius: 1rem; }
        .stat-value { font-size: 1.25rem; font-weight: 900; letter-spacing: -0.05em; line-height: 1; margin-bottom: 0.25rem; }
        .stat-label { font-size: 0.6rem; font-weight: 800; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.1em; }

        .object-cover { object-fit: cover; }
        .rounded-md { border-radius: 0.5rem; }
      `}} />
    </aside>
  );
}
