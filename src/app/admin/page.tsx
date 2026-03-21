import React from "react";
import { createClient } from "@/utils/supabase/server";
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
  Calendar
} from "lucide-react";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch summaries
  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5);
  const postCount = posts?.length || 0;

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
        <MetricCard label="Tổng lượt xem" value="12,482" trend="+12.5%" trendUp={true} icon={<Eye size={20} />} color="purple" />
        <MetricCard label="Bài viết" value={postCount.toString()} trend="Đang tăng" trendUp={true} icon={<FileText size={20} />} color="blue" />
        <MetricCard label="Tỷ lệ click" value="4.8%" trend="+0.8%" trendUp={true} icon={<MousePointer2 size={20} />} color="orange" />
      </div>

      {/* Two Column Layout for Widgets */}
      <div className="overview-widgets">
        <div className="w-column main-w">
          <div className="w-card">
            <div className="w-header">
              <h2 className="w-title">BÀI VIẾT GẦN ĐÂY</h2>
              <a href="/admin/posts" className="w-link">Xem tất cả <ChevronRight size={14} /></a>
            </div>
            <div className="recent-posts-list">
              {posts && posts.map(post => (
                <div key={post.id} className="r-post-item">
                  <div className="r-post-info">
                    <span className="r-post-title">{post.title}</span>
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

        <div className="w-column side-w">
          <div className="w-card promo-card pink">
             <div className="p-icon"><Sparkles size={24} /></div>
             <h3>Mẹo SEO hôm nay</h3>
             <p>Hãy thử thêm các từ khoá về 'Công nghệ' vào đoạn tóm tắt để tăng tỉ lệ hiển thị trên Google.</p>
             <button className="p-btn">Tất cả bài viết</button>
          </div>
          
          <div className="w-card activity-card">
             <div className="w-header">
                <h2 className="w-title">HOẠT ĐỘNG</h2>
             </div>
             <div className="activity-list">
                <div className="a-item">
                   <div className="a-dot blue"></div>
                   <div className="a-text">Bạn đã cập nhật bài viết 'Hello World'</div>
                   <div className="a-time">2h ago</div>
                </div>
                <div className="a-item">
                   <div className="a-dot purple"></div>
                   <div className="a-text">Có bình luận mới trong bài 'Deep Dive'</div>
                   <div className="a-time">5h ago</div>
                </div>
             </div>
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
        .m-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .metric-c { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 2rem; padding: 2.5rem; display: flex; flex-direction: column; gap: 1rem; transition: transform 0.3s; }
        .metric-c:hover { border-color: var(--accent-color); }
        .m-c-header { display: flex; justify-content: space-between; align-items: center; }
        .m-c-label { font-size: 0.7rem; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; }
        .m-c-icon { width: 3rem; height: 3rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
        .m-c-value { font-size: 2.75rem; font-weight: 900; letter-spacing: -0.04em; }
        .m-c-trend { font-size: 0.7rem; font-weight: 800; color: #22c55e; background: rgba(34, 197, 94, 0.08); padding: 0.25rem 0.6rem; border-radius: 2rem; align-self: flex-start; }

        .metric-c.purple .m-c-icon { background: rgba(147, 51, 234, 0.08); color: #9333ea; }
        .metric-c.blue .m-c-icon { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
        .metric-c.orange .m-c-icon { background: rgba(249, 115, 22, 0.08); color: #f97316; }

        /* Widgets */
        .overview-widgets { display: grid; grid-template-columns: 1fr 340px; gap: 3rem; }
        .w-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 2rem; padding: 2rem; height: 100%; }
        .w-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .w-title { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.1em; color: #888; }
        .w-link { color: var(--accent-color); text-decoration: none; font-size: 0.7rem; font-weight: 900; display: flex; align-items: center; gap: 0.25rem; }

        .r-post-item { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 0; border-bottom: 1px solid var(--border-color); }
        .r-post-item:last-child { border-bottom: none; }
        .r-post-title { font-weight: 800; font-size: 1.1rem; display: block; margin-bottom: 0.5rem; transition: color 0.2s; }
        .r-post-item:hover .r-post-title { color: #9333ea; }
        .r-post-meta { display: flex; gap: 1.5rem; font-size: 0.65rem; color: #999; font-weight: 700; text-transform: uppercase; }
        .r-cat { color: #9333ea; }
        .r-date { display: flex; align-items: center; gap: 0.4rem; }
        .r-post-btn { width: 2.5rem; height: 2.5rem; border: 1px solid var(--border-color); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: #aaa; transition: all 0.2s; }
        .r-post-btn:hover { background: #000; color: #fff; }
        [data-theme='dark'] .r-post-btn:hover { background: #fff; color: #000; }

        /* Sidebar Widgets */
        .w-card.promo-card { background: linear-gradient(135deg, #000, #111); color: #fff; border: none; }
        [data-theme='dark'] .w-card.promo-card { background: linear-gradient(135deg, #111, #000); }
        .p-icon { color: #9333ea; margin-bottom: 1.5rem; }
        .promo-card h3 { font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem; }
        .promo-card p { font-size: 0.85rem; color: #888; line-height: 1.6; margin-bottom: 2rem; }
        .p-btn { border: 1px solid #333; background: transparent; color: #fff; width: 100%; padding: 0.85rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 900; cursor: pointer; transition: all 0.2s; }
        .p-btn:hover { background: #fff; color: #000; }

        .activity-card { margin-top: 2rem; }
        .activity-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .a-item { display: flex; gap: 1rem; align-items: flex-start; position: relative; }
        .a-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 0.4rem; flex-shrink: 0; }
        .a-dot.blue { background: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }
        .a-dot.purple { background: #9333ea; box-shadow: 0 0 10px rgba(147, 51, 234, 0.4); }
        .a-text { font-size: 0.85rem; font-weight: 700; line-height: 1.4; }
        .a-time { font-size: 0.65rem; color: #999; font-weight: 800; margin-top: 0.25rem; }

        .animate-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1200px) { .overview-widgets { grid-template-columns: 1fr; } .m-grid { grid-template-columns: 1fr; } }
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
