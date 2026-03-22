import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { 
  TrendingUp, 
  Eye, 
  MessageSquare,
  FileText,
  MousePointer2,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Calendar,
  User
} from "lucide-react";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const adminClient = createAdminClient();

  // 1. Fetch Total Views & Clicks from site_stats
  const { data: globalStats } = await supabase.from('site_stats').select('*');
  const totalViews = globalStats?.find(s => s.key === 'total_views')?.value || 0;
  const totalClicks = globalStats?.find(s => s.key === 'total_clicks')?.value || 0;

  // 2. Fetch User Count (using Admin SDK)
  const usersResponse = await adminClient.auth.admin.listUsers();
  const userCount = usersResponse.data?.users?.length || 0;

  // 3. Fetch Recent Posts
  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5);

  // 4. Fetch All posts count
  const { count: totalPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true });

  // 5. Fetch Top Posts by Views
  const { data: topViewedPosts } = await supabase.from('posts').select('title, views_count, slug, category').order('views_count', { ascending: false }).limit(5);

  return (
    <div className="admin-overview animate-in">
      {/* Header Info */}
      <div className="overview-header">
        <div className="header-info">
          <span className="badge-std">Dashboard Overview</span>
          <h1 className="h-title">Chào buổi chiều, <span className="m-text">Linh.</span></h1>
          <p className="h-sub">Đây là tổng quan về hiệu suất blog của bạn hôm nay.</p>
        </div>
        <div className="header-actions">
          <a href="/admin/posts/new" className="btn-primary-std">
            <Sparkles size={16} />
            <span>Viết bài mới</span>
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="m-grid">
        <MetricCard label="Tổng lượt xem" value={totalViews.toLocaleString()} trend="+12.5%" trendUp={true} icon={<Eye size={20} />} color="purple" />
        <MetricCard label="Bài viết" value={(totalPosts || 0).toString()} trend="Đang tăng" trendUp={true} icon={<FileText size={20} />} color="blue" />
        <MetricCard label="Tổng lượt Click" value={totalClicks.toLocaleString()} trend="+0.8%" trendUp={true} icon={<MousePointer2 size={20} />} color="orange" />
        <MetricCard label="Số người dùng" value={userCount.toString()} trend="Đã đăng ký" trendUp={true} icon={<User size={20} />} color="green" />
      </div>

      {/* SEO Tip Banner (Horizontal) */}
      <div className="seo-tip-banner glass-morph">
        <div className="tip-content">
          <div className="tip-icon"><Sparkles size={24} /></div>
          <div className="tip-text">
            <h3>Mẹo SEO hôm nay</h3>
            <p>Hãy thử thêm các từ khoá về <strong>'Công nghệ'</strong> vào đoạn tóm tắt để tăng tỉ lệ hiển thị trên Google.</p>
          </div>
        </div>
        <a href="/admin/seo" className="tip-btn">Quản lý SEO <ChevronRight size={14} /></a>
      </div>

      {/* Single Column Layout for Widgets */}
      <div className="overview-widgets-single">
          <div className="w-card">
            <div className="w-header">
              <h2 className="w-title">LƯỢT XEM MỖI BÀI VIẾT (Top)</h2>
            </div>
            <div className="top-stats-list">
              {topViewedPosts && topViewedPosts.map(post => (
                <div key={post.slug} className="stat-row-item">
                  <div className="stat-name">
                     <span className="s-post-title">{post.title.replace(/\[\/?center\]/g, '')}</span>
                     <span className="s-post-cat">{post.category}</span>
                  </div>
                  <div className="stat-val-badge">
                     <Eye size={12} />
                     <strong>{post.views_count || 0}</strong> lượt xem
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-card">
            <div className="w-header">
              <h2 className="w-title">BÀI VIẾT GẦN ĐÂY</h2>
              <a href="/admin/posts" className="w-link">Xem tất cả <ChevronRight size={14} /></a>
            </div>
            <div className="recent-posts-list">
              {posts && posts.map(post => (
                <div key={post.id} className="r-post-item">
                  <div className="r-post-info">
                    <span className="r-post-title">{post.title.replace(/\[\/?center\]/g, '')}</span>
                    <div className="r-post-meta">
                      <span className="r-cat">{post.category}</span>
                      <span className="r-date"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a href={`/admin/posts/edit/${post.id}`} className="r-post-btn"><ArrowUpRight size={16} /></a>
                </div>
              ))}
            </div>
          </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-overview { display: flex; flex-direction: column; gap: 3rem; }
        .overview-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 3rem; border-bottom: 1px solid var(--border-color); }
        .badge-std { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.2em; color: #9333ea; text-transform: uppercase; margin-bottom: 0.75rem; display: block; }
        .h-title { font-size: 2.25rem; font-weight: 900; letter-spacing: -0.05em; }
        .m-text { color: #999; }
        .h-sub { color: #888; margin-top: 0.5rem; font-weight: 500; }

        .btn-primary-std { background: #000; color: #fff; padding: 1rem 1.75rem; border-radius: 1.25rem; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; gap: 0.75rem; text-decoration: none; transition: transform 0.2s; }
        [data-theme='dark'] .btn-primary-std { background: #fff; color: #000; }
        .btn-primary-std:hover { transform: scale(1.05); }

        /* Metrics */
        .m-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .metric-c { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 1.5rem; padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem; transition: transform 0.3s; }
        .metric-c:hover { border-color: var(--accent-color); }
        .m-c-header { display: flex; justify-content: space-between; align-items: center; }
        .m-c-label { font-size: 0.65rem; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; }
        .m-c-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .m-c-value { font-size: 2rem; font-weight: 900; letter-spacing: -0.04em; }
        .m-c-trend { font-size: 0.65rem; font-weight: 800; color: #22c55e; background: rgba(34, 197, 94, 0.08); padding: 0.25rem 0.6rem; border-radius: 2rem; align-self: flex-start; }

        .metric-c.purple .m-c-icon { background: rgba(147, 51, 234, 0.08); color: #9333ea; }
        .metric-c.blue .m-c-icon { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
        .metric-c.orange .m-c-icon { background: rgba(249, 115, 22, 0.08); color: #f97316; }
        .metric-c.green .m-c-icon { background: rgba(34, 197, 94, 0.08); color: #22c55e; }

        /* Stats List */
        .top-stats-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .stat-row-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-color); }
        .stat-row-item:last-child { border-bottom: none; }
        .stat-name { display: flex; flex-direction: column; gap: 0.25rem; }
        .s-post-title { font-size: 0.95rem; font-weight: 700; color: #1a1a1a; }
        .s-post-cat { font-size: 0.65rem; font-weight: 800; color: #9333ea; text-transform: uppercase; }
        .stat-val-badge { display: flex; align-items: center; gap: 0.5rem; background: #f5f5f5; padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.75rem; color: #666; }
        .stat-val-badge strong { color: #000; font-weight: 900; font-size: 0.9rem; }

        /* SEO Tip Banner */
        .seo-tip-banner { 
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05)); 
          border: 1px solid rgba(147, 51, 234, 0.2);
          border-radius: 1.5rem; padding: 1.5rem 2.5rem;
          display: flex; justify-content: space-between; align-items: center;
          backdrop-filter: blur(10px);
        }
        .tip-content { display: flex; align-items: center; gap: 1.5rem; }
        .tip-icon { color: #9333ea; }
        .tip-text h3 { font-size: 0.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #9333ea; margin-bottom: 0.25rem; }
        .tip-text p { font-size: 0.95rem; font-weight: 600; color: #333; }
        [data-theme='dark'] .tip-text p { color: #ccc; }
        .tip-btn { background: #000; color: #fff; padding: 0.75rem 1.25rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 800; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s; }
        [data-theme='dark'] .tip-btn { background: #fff; color: #000; }
        .tip-btn:hover { transform: translateX(5px); }

        /* Widgets Single Column */
        .overview-widgets-single { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
        .w-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 1.5rem; padding: 2.5rem; height: 100%; }
        .w-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .w-title { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.1em; color: #aaa; text-transform: uppercase; }
        .w-link { color: var(--accent-color); text-decoration: none; font-size: 0.7rem; font-weight: 900; display: flex; align-items: center; gap: 0.25rem; }

        .r-post-item { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 0; border-bottom: 1px solid var(--border-color); }
        .r-post-item:last-child { border-bottom: none; }
        .r-post-title { font-weight: 800; font-size: 1rem; display: block; margin-bottom: 0.5rem; transition: color 0.2s; }
        .r-post-item:hover .r-post-title { color: #9333ea; }
        .r-post-meta { display: flex; gap: 1.5rem; font-size: 0.65rem; color: #999; font-weight: 700; text-transform: uppercase; }
        .r-cat { color: #9333ea; }
        .r-date { display: flex; align-items: center; gap: 0.4rem; }
        .r-post-btn { width: 2.5rem; height: 2.5rem; border: 1px solid var(--border-color); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: #aaa; transition: all 0.2s; }
        .r-post-btn:hover { background: #000; color: #fff; border-color: #000; }
        [data-theme='dark'] .r-post-btn:hover { background: #fff; color: #000; border-color: #fff; }

        .animate-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1400px) { .m-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 1200px) { .overview-widgets-single { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { 
          .m-grid { grid-template-columns: 1fr; }
          .seo-tip-banner { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .tip-btn { width: 100%; justify-content: center; }
        }
      `}} />
    </div>
  );
}

function MetricCard({ label, value, trend, trendUp, icon, color }: any) {
  return (
    <div className={`metric-c ${color}`}>
      <div className="m-c-header">
        <span className="m-c-label">{label}</span>
        <div className="m-c-icon">{icon}</div>
      </div>
      <div className="m-c-value">{value}</div>
      <div className="m-c-trend">{trend}</div>
    </div>
  );
}
