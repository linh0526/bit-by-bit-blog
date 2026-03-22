import { Search } from "lucide-react";
import React from "react";
import UserStatus from "./components/UserStatus";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-root">
      <header className="header glass fixed-top">
        <nav className="nav header-grid">
          <div className="header-left">
            <a href="/" className="logo">
              <span className="logo-bit">bitbybit</span>
              <span className="logo-separator">/</span>
              <span className="logo-bit">with_linh</span>
            </a>
          </div>
          <div className="header-center">
            <div className="nav-links">
              <a href="/" className="nav-link">BLOG</a>
              <a href="/about" className="nav-link">ABOUT</a>
            </div>
          </div>
          <div className="header-right">
            <form action="/" className="header-search-form">
              <input 
                type="text" 
                name="q" 
                placeholder="Tìm..." 
                className="header-search-input"
              />
              <button type="submit" className="search-btn-icon"><Search size={16} /></button>
            </form>
            <UserStatus />
          </div>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer container">
        <p className="copyright">© {new Date().getFullYear()} Bit-by-Bit / with Linh</p>
        <div className="social">
          <span className="social-item">Github</span>
          <span className="social-item">LinkedIn</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0.5rem 0;
          background-color: #000000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .header-grid {
          display: grid;
          grid-template-columns: 320px 1fr 340px;
          align-items: center;
          width: 100%;
          max-width: 100%;
        }
        .header-left { padding-left: 2.5rem; }
        .header-center { display: flex; justify-content: center; }
        .header-right { 
          display: flex; 
          justify-content: flex-end; 
          padding-right: 2.5rem; 
          gap: 1.5rem;
          align-items: center;
        }

        .logo {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.05em;
          text-transform: uppercase;
        }
        .logo-separator {
          margin: 0 0.5rem;
          opacity: 0.3;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          opacity: 0.8;
          transition: all 0.2s;
        }
        .nav-link:hover {
          opacity: 1;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .header-search-form {
          position: relative;
          display: flex;
          align-items: center;
          width: 200px;
        }
        .header-search-input {
          width: 100%;
          padding: 0.4rem 1rem;
          padding-right: 2.2rem;
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 0.8rem;
          outline: none;
          transition: all 0.3s ease;
        }
        .header-search-input:focus {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          width: 240px;
        }
        .search-btn-icon {
          position: absolute;
          right: 0.8rem;
          background: none;
          border: none;
          font-size: 0.8rem;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
        }
        .search-btn-icon:hover {
          color: #ffffff;
        }
        .main-content {
          flex-grow: 1;
        }
        .footer {
          padding: 0.5rem 0 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--color-border);
          opacity: 0.6;
          font-size: 0.8125rem;
        }
        .social {
          display: flex;
          gap: 1.5rem;
        }
      `}} />
    </div>
  );
}
