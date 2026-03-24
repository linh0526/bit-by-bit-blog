"use client";
import React from "react";

export default function Loading() {
  return (
    <div className="global-loading-container">
      {/* Top Progress Bar - Fixed to Top */}
      <div className="global-top-loader"></div>
      
      {/* COLUMN 1: TOC SKELETON */}
      <aside className="side-toc-container">
        <div className="skeleton-box" style={{ width: '80%', height: '24px', marginBottom: '2rem', backgroundColor: '#000000ff' }}></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-box" style={{ width: i % 2 === 0 ? '60%' : '50%', height: '14px', marginBottom: '1rem', opacity: 0.5 }}></div>
        ))}
      </aside>

      {/* COLUMN 2: ARTICLE SKELETON */}
      <main className="article-column">
        <div className="skeleton-meta" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div className="skeleton-box" style={{ width: '70px', height: '18px', borderRadius: '1rem' }}></div>
          <div className="skeleton-box" style={{ width: '120px', height: '18px' }}></div>
        </div>
        
        <div className="skeleton-box" style={{ width: '100%', height: '5rem', marginBottom: '2rem' }}></div>
        <div className="skeleton-box" style={{ width: '80%', height: '2rem', marginBottom: '4rem' }}></div>
        
        <div className="skeleton-content">
           {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-box" style={{ width: '100%', height: '1.2rem', marginBottom: '1.25rem', opacity: 1 - (i * 0.1) }}></div>
           ))}
        </div>
      </main>

      <style jsx global>{`
        .global-top-loader {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #9333ea, #3b82f6, #60a5fa, #9333ea);
          background-size: 200% 100%;
          z-index: 10000;
          animation: 
            progress-slide 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards,
            progress-shimmer 2s linear infinite;
        }

        @keyframes progress-slide {
          from { transform: scaleX(0); transform-origin: left; }
          60% { transform: scaleX(0.8); transform-origin: left; }
          to { transform: scaleX(0.98); transform-origin: left; }
        }

        @keyframes progress-shimmer {
          to { background-position: 200% 0; }
        }

        .skeleton-box {
          background: #f4f4f4;
          border-radius: 6px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .side-toc-container {
          padding: 3.5rem 2.25rem;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          background: #000000;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .side-toc-container .skeleton-box {
          background: #111;
        }
      `}</style>
    </div>
  );
}
