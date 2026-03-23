import { Search } from "lucide-react";
import React, { Suspense } from "react";
import UserStatus from "./components/UserStatus";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import SearchInput from "./components/SearchInput";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="layout-root">
      <header className="header glass fixed-top">
        <nav className="nav header-grid">
          <div className="header-left">
            <Link href="/" className="logo">
              <span className="logo-bit">bitbybit</span>
              <span className="logo-separator">/</span>
              <span className="logo-bit">with_linh</span>
            </Link>
          </div>
          <div className="header-center">
            <div className="nav-links">
              <Link href="/" className="nav-link">BLOG</Link>
              <Link href="/about" className="nav-link">ABOUT</Link>
            </div>
          </div>
          <div className="header-right">
            <Suspense fallback={<div className="search-placeholder" />}>
              <SearchInput />
            </Suspense>
            <UserStatus initialUser={user} />
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
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          width: 100%;
          padding: 0 2.5rem;
        }
        .header-left { display: flex; justify-content: flex-start; }
        .header-center { display: flex; justify-content: center; }
        .header-right { 
          display: flex; 
          justify-content: flex-end; 
          gap: 1rem;
          align-items: center;
        }
        .search-placeholder { 
          width: 140px; 
          height: 32px; 
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
        }

        @media (max-width: 1024px) {
          .header-grid {
            grid-template-columns: 1fr auto;
            padding: 0 1rem;
          }
          .header-center { display: none; }
          .logo { font-size: 1rem; }
          .search-placeholder { width: 100px; }
        }

        @media (max-width: 480px) {
           .logo { font-size: 0.85rem; }
           .logo-separator { margin: 0 0.15rem; }
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
        .main-content {
          flex-grow: 1;
        }
        .footer {
          padding: 1rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--color-border);
          opacity: 0.6;
          font-size: 0.8125rem;
        }
        @media (max-width: 600px) {
          .footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 2rem 0;
          }
        }
        .social {
          display: flex;
          gap: 1.5rem;
        }
      `}} />
    </div>
  );
}
