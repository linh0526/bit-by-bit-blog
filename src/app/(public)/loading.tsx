"use client";
import React from "react";

export default function Loading() {
  return (
    <div className="global-loading-container">
      {/* Top Progress Bar - Fixed to Top */}
      <div className="global-top-loader"></div>

      <main className="feed-column-home" style={{ padding: '3rem 4rem' }}>
        <div className="skeleton-box" style={{ width: '400px', height: '3.5rem', marginBottom: '4rem', opacity: 0.1 }}></div>
        
        <div className="skeleton-grid-loader">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-post">
              <div className="skeleton-box" style={{ width: '100%', aspectRatio: '16/10', borderRadius: '1.25rem', marginBottom: '1.5rem' }}></div>
              <div className="skeleton-box" style={{ width: '90%', height: '1.5rem', marginBottom: '0.75rem' }}></div>
              <div className="skeleton-box" style={{ width: '60%', height: '1rem' }}></div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        .global-loading-container {
          width: 100%;
          min-height: 100vh;
          background: #ffffff;
        }

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

        .skeleton-grid-loader {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4rem 2rem;
        }

        .skeleton-box {
          background: #f7f7f7;
          border-radius: 8px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .feed-column-home {
          grid-column: 1 / 3;
          background: #ffffff;
        }

        @media (max-width: 1024px) {
          .skeleton-grid-loader { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .skeleton-grid-loader { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
