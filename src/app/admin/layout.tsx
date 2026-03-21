import React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Plus,
  Home,
  User,
  Bell,
  Search,
  ChevronRight,
  Tags
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout-root">
      {/* MASTER SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-box">
              <span>B</span>
            </div>
            <div className="logo-text">
              <h2>BITADMIN</h2>
              <p>v1.0 PREMIUM</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-group">
              <span className="group-label">Hệ thống</span>
              <ul className="nav-list">
                <NavItem href="/admin" icon={<LayoutDashboard size={18} />} label="Bảng điều khiển" />
                <NavItem href="/admin/posts" icon={<FileText size={18} />} label="Quản lý bài viết" />
                <NavItem href="/admin/taxonomies" icon={<Tags size={18} />} label="Danh mục & Tags" />
              </ul>
            </div>

            <div className="nav-group">
              <span className="group-label">Nội dung</span>
              <ul className="nav-list">
                <NavItem href="/admin/posts/new" icon={<Plus size={18} />} label="Viết bài mới" />
                <NavItem href="#" icon={<Settings size={18} />} label="Cài đặt Blog" />
              </ul>
            </div>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-sep"></div>
          <a href="/" className="footer-link">
            <Home size={18} />
            <span>Xem trang chủ</span>
          </a>
          <button className="logout-btn">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* VIEWPORT AREA */}
      <div className="admin-main-viewport">
        {/* GLOBAL HEADER */}
        <header className="admin-top-bar">
          <div className="top-bar-left">
            <div className="search-trigger">
              <Search size={16} />
              <span>Tìm kiếm nhanh...</span>
              <kbd>⌘K</kbd>
            </div>
          </div>
          
          <div className="top-bar-right">
            <button className="header-icon-btn">
              <Bell size={18} />
              <span className="notif-dot"></span>
            </button>
            <div className="header-divider"></div>
            <div className="profile-widget">
              <div className="profile-text text-right">
                <span className="p-name">Linh Nguyen</span>
                <span className="p-role">Administrator</span>
              </div>
              <div className="p-avatar">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="admin-page-content">
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        :root {
          --sidebar-width: 280px;
          --header-height: 70px;
          --admin-bg: #fcfcfc;
          --card-bg: #ffffff;
          --border-color: #f1f1f1;
          --accent-color: #000000;
        }

        [data-theme='dark'] {
          --admin-bg: #000000;
          --card-bg: #0a0a0a;
          --border-color: #1a1a1a;
          --accent-color: #ffffff;
        }

        .admin-layout-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background-color: var(--admin-bg);
          color: var(--accent-color);
          display: flex;
        }

        /* Sidebar Styles */
        .admin-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: var(--sidebar-width);
          background-color: var(--card-bg);
          border-right: 1px solid var(--border-color);
          z-index: 100;
          display: flex;
          flex-direction: column;
          padding: 2.5rem 1.5rem;
          justify-content: space-between;
        }

        .sidebar-logo { display: flex; align-items: center; gap: 1rem; margin-bottom: 4rem; padding: 0 1rem; }
        .logo-box { width: 2.5rem; height: 2.5rem; background: #000; color: #fff; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.25rem; }
        [data-theme='dark'] .logo-box { background: #fff; color: #000; }
        .logo-text h2 { font-size: 1rem; font-weight: 900; letter-spacing: 0.1em; line-height: 1; }
        .logo-text p { font-size: 0.6rem; color: #888; font-weight: 800; margin-top: 0.25rem; letter-spacing: 0.1em; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 2.5rem; }
        .nav-group .group-label { font-size: 0.65rem; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1.25rem; display: block; padding-left: 1rem; }
        .nav-list { list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }

        .nav-link { 
          display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; 
          border-radius: 0.75rem; color: #555; text-decoration: none; font-size: 0.85rem; 
          font-weight: 600; transition: all 0.2s; 
        }
        [data-theme='dark'] .nav-link { color: #888; }
        .nav-link:hover { color: var(--accent-color); background: var(--admin-bg); }
        .nav-link.active { background: var(--accent-color); color: var(--card-bg); font-weight: 800; }

        .sidebar-bottom { display: flex; flex-direction: column; gap: 0.5rem; }
        .sidebar-sep { height: 1px; background: var(--border-color); margin-bottom: 1.5rem; }
        .footer-link, .logout-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border-radius: 0.75rem; color: #666; font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: all 0.2s; }
        .footer-link:hover { background: var(--admin-bg); color: var(--accent-color); }
        .logout-btn { width: 100%; border: none; background: none; color: #ef4444; cursor: pointer; }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.05); }

        /* Main Viewport */
        .admin-main-viewport { flex-grow: 1; margin-left: var(--sidebar-width); min-height: 100vh; display: flex; flex-direction: column; }

        .admin-top-bar { 
          height: var(--header-height); border-bottom: 1px solid var(--border-color); 
          background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); 
          position: sticky; top: 0; z-index: 90; display: flex; align-items: center; 
          justify-content: space-between; padding: 0 4rem; 
        }
        [data-theme='dark'] .admin-top-bar { background-color: rgba(0, 0, 0, 0.7); }

        .search-trigger { 
          display: flex; align-items: center; gap: 0.75rem; background: var(--admin-bg); 
          padding: 0.5rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);
          color: #999; font-size: 0.75rem; font-weight: 600; cursor: pointer; width: 300px;
        }
        .search-trigger kbd { background: var(--card-bg); padding: 0.1rem 0.4rem; border-radius: 0.25rem; border: 1px solid var(--border-color); margin-left: auto; font-size: 0.65rem; }

        .top-bar-right { display: flex; align-items: center; gap: 1.5rem; }
        .header-icon-btn { position: relative; color: #999; border: none; background: none; cursor: pointer; transition: color 0.2s; }
        .header-icon-btn:hover { color: var(--accent-color); }
        .notif-dot { position: absolute; top: -2px; right: -2px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 2px solid #fff; }
        .header-divider { width: 1px; height: 1.5rem; background: var(--border-color); }

        .profile-widget { display: flex; align-items: center; gap: 1rem; }
        .profile-text { display: flex; flex-direction: column; }
        .p-name { font-size: 0.85rem; font-weight: 900; }
        .p-role { font-size: 0.6rem; font-weight: 700; color: #999; text-transform: uppercase; }
        .p-avatar { width: 2.25rem; height: 2.25rem; border-radius: 50%; background: var(--admin-bg); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: #999; }

        .admin-page-content { padding: 4rem; max-width: 1400px; margin: 0 auto; width: 100%; }

        @media (max-width: 1200px) {
          .admin-page-content { padding: 2rem; }
          .admin-top-bar { padding: 0 2rem; }
        }
      `}} />
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  // Simple check for active state (normally you'd use usePathname in a client child)
  return (
    <li>
      <a href={href} className="nav-link">
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
}
