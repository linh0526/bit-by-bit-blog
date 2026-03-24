import React from "react";

export default function Loading() {
  return (
    <div className="blog-post-page-root">
      <div className="three-column-layout">
        
        {/* LEFT COLUMN SKELETON */}
        <aside className="sidebar-column left-sidebar">
          <div className="skeleton-box" style={{ width: '100%', height: '20px', marginBottom: '2rem' }}></div>
          <div className="skeleton-box" style={{ width: '80%', height: '15px', marginBottom: '1rem' }}></div>
          <div className="skeleton-box" style={{ width: '70%', height: '15px', marginBottom: '1rem' }}></div>
        </aside>

        {/* CENTER COLUMN SKELETON */}
        <main className="article-column">
          <div className="skeleton-meta" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div className="skeleton-box" style={{ width: '60px', height: '20px', borderRadius: '1rem' }}></div>
            <div className="skeleton-box" style={{ width: '100px', height: '20px' }}></div>
          </div>
          
          <div className="skeleton-box" style={{ width: '100%', height: '60px', marginBottom: '2rem' }}></div>
          <div className="skeleton-box" style={{ width: '100%', height: '30px', marginBottom: '3rem' }}></div>
          
          <div className="skeleton-content">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-box" style={{ width: '100%', height: '18px', marginBottom: '1rem', opacity: 1 - (i * 0.1) }}></div>
             ))}
          </div>
        </main>

        {/* RIGHT COLUMN SKELETON */}
        <aside className="sidebar-column-white-scroll right-sidebar">
           <div className="sidebar-widget">
              <div className="skeleton-box" style={{ width: '40%', height: '15px', marginBottom: '1.5rem' }}></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                   <div className="skeleton-box" style={{ width: '50px', height: '50px', borderRadius: '6px' }}></div>
                   <div style={{ flex: 1 }}>
                      <div className="skeleton-box" style={{ width: '90%', height: '14px', marginBottom: '0.5rem' }}></div>
                      <div className="skeleton-box" style={{ width: '40%', height: '10px' }}></div>
                   </div>
                </div>
              ))}
           </div>
        </aside>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-post-page-root { font-family: sans-serif; background-color: #ffffff; min-height: 100vh; }
        .three-column-layout { display: grid; grid-template-columns: 320px 1fr 340px; }
        .sidebar-column { background-color: #000000; padding: 3rem 2.5rem; }
        .sidebar-column-white-scroll { padding: 3rem 1.5rem; border-left: 1px solid #f0f0f0; }
        .article-column { padding: 3rem 4.5rem; max-width: 900px; margin: 0 auto; width: 100%; }
        
        .skeleton-box {
          background: #f0f0f0;
          border-radius: 4px;
        }

        .sidebar-column .skeleton-box {
          background: #111;
        }

        @media (max-width: 1100px) {
          .three-column-layout { grid-template-columns: 1fr; }
          .left-sidebar, .right-sidebar { display: none; }
        }
      `}} />
    </div>
  );
}
