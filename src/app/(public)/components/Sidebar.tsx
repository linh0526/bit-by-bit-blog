import React from "react";
import Image from "next/image";
import { TrendingUp, Clock, BarChart3, Instagram, Github, Mail, Facebook } from "lucide-react";

interface SidebarProps {
  latestPosts?: any[];
  supabaseUrl?: string;
  isAboutPage?: boolean;
}

export default function Sidebar({ latestPosts, supabaseUrl, isAboutPage }: SidebarProps) {
  const profileImageUrl = supabaseUrl 
    ? `${supabaseUrl}/storage/v1/object/public/images/1774099534011-p4ncl14qqu.png`
    : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop";

  return (
    <aside className="sidebar-column-white-scroll right-sidebar animate-in-right">
      <div className="sidebar-flow-content">
        {/* Top Posts */}
        {latestPosts && latestPosts.length > 0 && (
          <div className="sidebar-widget">
            <h3 className="widget-label-dark"><TrendingUp size={14} /> TOP POSTS</h3>
            <div className="related-mini-list-dark">
              {latestPosts.slice(0, 3).map((lp: any, idx: number) => (
                <a key={idx} href={`/${lp.slug}`} className="related-card-mini-dark">
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
                    <span className="mini-title-dark">{lp.title}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Latest Posts */}
        {latestPosts && latestPosts.length > 0 && (
          <div className="sidebar-widget">
            <h3 className="widget-label-dark"><Clock size={14} /> MỚI NHẤT</h3>
            <div className="related-mini-list-dark">
              {latestPosts.map((lp: any) => (
                <a key={lp.slug} href={`/${lp.slug}`} className="related-card-mini-dark">
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
                  <span className="mini-title-dark">{lp.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* About Me Segment */}
        <div className="sidebar-widget">
          <h3 className="widget-label-dark">ABOUT ME</h3>
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
                  <span className="author-role-tiny">Developer / Student</span>
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
              <a href="/about" className="see-more-about-btn">
                XEM CHI TIẾT <span>→</span>
              </a>
            )}
          </div>
        </div>

        {/* BLOG STATS */}
        <div className="sidebar-widget">
          <h3 className="widget-label-dark"><BarChart3 size={16} /> BLOG STATS</h3>
          <div className="stats-box-minimal">
            <div className="stat-value">14,449,271</div>
            <div className="stat-label">tổng lượt xem bài viết</div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-column-white-scroll {
          background-color: #ffffff;
          padding: 6rem 1.5rem;
          border-left: 1px solid #f0f0f0;
        }
        .sidebar-flow-content { display: flex; flex-direction: column; }
        .widget-label-dark { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.2rem; color: #aaa; margin-bottom: 1.25rem; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; }
        .sidebar-widget { margin-bottom: 4rem; }
        
        .related-mini-list-dark { display: flex; flex-direction: column; gap: 1.25rem; }
        .related-card-mini-dark { display: flex; gap: 1rem; text-decoration: none; color: inherit; align-items: flex-start; }
        .mini-thumb-rounded { width: 50px; height: 50px; min-width: 50px; position: relative; border-radius: 6px; border: 1px solid #eee; overflow: hidden; }
        .mini-content-col { display: flex; flex-direction: column; justify-content: start; gap: 0.2rem; }
        .mini-title-dark { font-size: 0.8rem; font-weight: 700; line-height: 1.35; color: #1a1a1a; transition: color 0.2s; }
        .related-card-mini-dark:hover .mini-title-dark { color: #9333ea; }
        
        /* About Me Refined (Premium Box restored) */
        .about-me-premium-box { background: #fafafa; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f0f0f0; }
        .about-me-header-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .profile-pic-mini { border-radius: 0.75rem; object-fit: cover; background: #eee; }
        .about-me-name-col { display: flex; flex-direction: column; }
        .author-name-small { font-size: 0.85rem; font-weight: 800; color: #000; }
        .author-role-tiny { font-size: 0.6rem; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .about-desc-refined { font-size: 0.75rem; line-height: 1.65; color: #555; margin-bottom: 1.25rem; }
        
        .social-follow-row { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px dashed #eee; margin-bottom: 1.25rem; }
        .follow-label { font-size: 0.6rem; font-weight: 900; color: #bbb; letter-spacing: 0.1em; }
        .social-links-mini { display: flex; gap: 0.75rem; color: #888; }
        .social-links-mini a { color: inherit; transition: all 0.2s; }
        .social-links-mini a:hover { color: #000; transform: translateY(-2px); }

        .see-more-about-btn { 
          display: block; 
          width: 100%; 
          text-align: center; 
          background: #000; 
          color: #fff; 
          padding: 0.6rem; 
          border-radius: 0.5rem; 
          font-size: 0.65rem; 
          font-weight: 800; 
          text-decoration: none; 
          letter-spacing: 0.1em;
          transition: all 0.2s;
        }
        .see-more-about-btn:hover { background: #333; transform: scale(1.02); }
        
        .stats-box-minimal { background: #000; color: #fff; padding: 1.5rem; border-radius: 1rem; }
        .stat-value { font-size: 1.25rem; font-weight: 900; letter-spacing: -0.05em; line-height: 1; margin-bottom: 0.25rem; }
        .stat-label { font-size: 0.6rem; font-weight: 800; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.1em; }

        .object-cover { object-fit: cover; }
        .rounded-md { border-radius: 0.375rem; }
      `}} />
    </aside>
  );
}
