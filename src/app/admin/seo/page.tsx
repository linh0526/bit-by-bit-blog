import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { 
  Sparkles, 
  Search, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ImageIcon,
  Type,
  FileText
} from "lucide-react";

export default async function AdminSEOPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch all posts with their SEO columns
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, seo_title, seo_description, image_url, image_alt')
    .order('created_at', { ascending: false });

  return (
    <div className="seo-manager animate-in">
      <div className="overview-header">
        <div className="header-info">
          <span className="badge-std">SEO Optimization</span>
          <h1 className="h-title">Quản lý <span className="m-text">SEO.</span></h1>
          <p className="h-sub">Theo dõi và tối ưu hóa khả năng tìm kiếm của từng bài viết.</p>
        </div>
      </div>

      <div className="seo-table-card">
        <table className="seo-table">
          <thead>
            <tr>
              <th>Bài viết</th>
              <th>Tiêu đề SEO</th>
              <th>Mô tả SEO</th>
              <th>SEO Ảnh (Alt)</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts && posts.map(post => {
              const hasSeoTitle = !!post.seo_title;
              const hasSeoDesc = !!post.seo_description;
              const hasAlt = !!post.image_alt;
              
              return (
                <tr key={post.id} className="seo-row">
                  <td className="post-cell">
                    <div className="p-title-box">
                       <strong>{post.title.replace(/\[\/?center\]/g, '')}</strong>
                       <span>/{post.slug}</span>
                    </div>
                  </td>
                  
                  <td>
                    <StatusBadge 
                      active={hasSeoTitle} 
                      label={post.seo_title || "Chưa đặt"} 
                      icon={<Type size={12} />}
                    />
                  </td>
                  
                  <td>
                    <StatusBadge 
                      active={hasSeoDesc} 
                      label={hasSeoDesc ? (post.seo_description.substring(0, 30) + '...') : "Chưa đặt"} 
                      icon={<FileText size={12} />}
                    />
                  </td>
                  
                  <td>
                    <StatusBadge 
                      active={hasAlt} 
                      label={post.image_alt || "Chưa đặt"} 
                      icon={<ImageIcon size={12} />}
                    />
                  </td>
                  
                  <td className="text-right">
                    <a href={`/admin/posts/edit/${post.id}`} className="seo-edit-btn">
                      <span>Tối ưu</span>
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .seo-manager { display: flex; flex-direction: column; gap: 3rem; }
        .overview-header { display: flex; justify-content: space-between; align-items: center; }
        .h-title { font-size: 3rem; font-weight: 900; letter-spacing: -0.05em; }
        .m-text { color: #9333ea; }
        .h-sub { color: #666; font-size: 1.1rem; margin-top: 0.5rem; }
        .badge-std { background: #f0f0f0; padding: 0.4rem 0.8rem; border-radius: 2rem; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #888; letter-spacing: 0.1em; margin-bottom: 1rem; display: inline-block; }

        .seo-table-card { background: #fff; border: 1px solid #eee; border-radius: 2rem; overflow: hidden; }
        .seo-table { width: 100%; border-collapse: collapse; text-align: left; }
        .seo-table th { padding: 1.5rem 2rem; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; color: #aaa; border-bottom: 1px solid #eee; }
        .seo-table td { padding: 1.5rem 2rem; border-bottom: 1px solid #eee; vertical-align: middle; }
        .seo-row:hover { background: #fafafa; }
        
        .post-cell .p-title-box { display: flex; flex-direction: column; gap: 0.25rem; }
        .p-title-box strong { font-size: 0.95rem; color: #000; font-weight: 800; }
        .p-title-box span { font-size: 0.75rem; color: #aaa; font-family: monospace; }
        
        .seo-edit-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #000; color: #fff; padding: 0.6rem 1.2rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: 800; text-decoration: none; transition: transform 0.2s; }
        .seo-edit-btn:hover { transform: scale(1.05); }

        .s-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: 700; white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
        .s-badge.active { background: rgba(34, 197, 94, 0.08); color: #22c55e; }
        .s-badge.pending { background: rgba(239, 68, 68, 0.08); color: #ef4444; }

        .animate-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .text-right { text-align: right; }
      `}} />
    </div>
  );
}

function StatusBadge({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <div className={`s-badge ${active ? 'active' : 'pending'}`}>
      {active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {icon}
      <span>{label}</span>
    </div>
  );
}
