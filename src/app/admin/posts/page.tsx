import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit, 
  Eye, 
  Heart,
  Filter,
  ArrowUpRight,
  FileText
} from "lucide-react";
import DeleteButton from "../components/DeleteButton";

export default async function PostsManagement() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch posts from Supabase
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <div className="admin-posts-page animate-in">
      <div className="page-header">
        <div className="header-info">
          <span className="badge-pulse">Management</span>
          <h1 className="page-title">QUẢN LÝ BÀI VIẾT</h1>
          <p className="page-sub">Danh sách toàn bộ các bài viết của bạn trên bit-by-bit</p>
        </div>
        <div className="header-actions">
          <a href="/admin/posts/new" className="btn-primary">
            <Plus size={18} />
            <span>Viết bài mới</span>
          </a>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">DANH MỤC {posts?.length || 0} BÀI VIẾT</h2>
          <div className="card-tools">
            <div className="search-box">
              <Search className="search-icon" size={16} />
              <input type="text" placeholder="Tìm bài viết..." />
            </div>
            <button className="btn-icon">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>THÔNG TIN BÀI VIẾT</th>
                <th>DANH MỤC</th>
                <th>NGÀY ĐĂNG</th>
                <th className="text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id}>
                    <td className="post-info-td">
                      <div className="post-info">
                        <span className="post-title-link">{post.title}</span>
                        <div className="post-meta-sub">
                          <span className="slug-badge">/{post.slug}</span>
                          <span className="view-count" title="Lượt xem"><Eye size={12} /> {post.views_count || 0} views</span>
                          <span className="view-count" title="Lượt thích" style={{ color: '#ef4444' }}><Heart size={12} fill="#ef4444" /> {post.likes_count || 0} likes</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge ${post.category?.toLowerCase()}`}>
                        {post.category}
                      </span>
                    </td>
                    <td>
                      <div className="date-info">
                        <span className="date-main">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                        <span className="status-label">CÔNG KHAI</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <a href={`/blog/${post.slug}`} target="_blank" className="action-btn">
                          <ArrowUpRight size={18} />
                        </a>
                        <a href={`/admin/posts/edit/${post.id}`} className="action-btn edit">
                          <Edit size={18} />
                        </a>
                        <DeleteButton id={post.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state-td">
                    <div className="empty-state">
                      <div className="empty-icon"><FileText size={32} /></div>
                      <h3>Chưa có bài viết nào</h3>
                      <a href="/admin/posts/new" className="btn-primary">Tạo bài viết đầu tiên</a>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-posts-page { display: flex; flex-direction: column; gap: 3rem; padding-bottom: 5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
        [data-theme='dark'] .page-header { border-bottom-color: #1a1a1a; }
        .badge-pulse { font-size: 0.625rem; font-weight: 900; letter-spacing: 0.3em; color: #9333ea; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
        .page-title { font-size: 2.25rem; font-weight: 900; letter-spacing: -0.05em; }
        .page-sub { color: #666; font-size: 0.9rem; margin-top: 0.5rem; }

        .btn-primary { background: #000; color: #fff; padding: 1rem 2rem; border-radius: 1.25rem; text-decoration: none; font-weight: 900; font-size: 0.75rem; display: flex; align-items: center; gap: 0.75rem; transition: transform 0.2s; }
        [data-theme='dark'] .btn-primary { background: #fff; color: #000; }
        .btn-primary:hover { transform: scale(1.05); }

        .content-card { background: #fff; border: 1px solid #eee; border-radius: 2rem; overflow: hidden; }
        [data-theme='dark'] .content-card { background: #000; border-color: #1a1a1a; }
        .card-header { padding: 2rem; border-bottom: 1px solid #f9fafb; display: flex; justify-content: space-between; align-items: center; }
        [data-theme='dark'] .card-header { border-bottom-color: #1a1a1a; }
        .card-title { font-size: 0.8rem; font-weight: 900; letter-spacing: 0.1em; color: #888; }
        
        .search-box { position: relative; width: 18rem; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #aaa; }
        .search-box input { width: 100%; border: 1px solid #eee; padding: 0.75rem 1rem 0.75rem 2.75rem; border-radius: 1rem; outline: none; font-size: 0.85rem; }
        [data-theme='dark'] .search-box input { background: #111; border-color: #222; color: #fff; }

        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 1.25rem 2rem; font-size: 0.65rem; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em; text-align: left; }
        .admin-table td { padding: 1.5rem 2rem; border-bottom: 1px solid #f9fafb; }
        [data-theme='dark'] .admin-table td { border-bottom-color: #1a1a1a; }
        .post-title-link { font-weight: 800; font-size: 1.1rem; color: #000; }
        [data-theme='dark'] .post-title-link { color: #fff; }
        .post-meta-sub { font-size: 0.75rem; display: flex; gap: 1rem; margin-top: 0.25rem; color: #888; }
        .slug-badge { color: #9333ea; font-style: italic; }

        .category-badge { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; padding: 0.4rem 1rem; border-radius: 2rem; background: #f5f5f5; color: #666; }
        .category-badge.insight { background: rgba(147, 51, 234, 0.1); color: #9333ea; }
        .category-badge.tech { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

        .table-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .action-btn { width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; border: 1px solid #eee; border-radius: 0.75rem; color: #333; background: #fff; cursor: pointer; transition: all 0.2s; }
        [data-theme='dark'] .action-btn { background: #000; border-color: #222; color: #fff; }
        .action-btn:hover { background: #000; color: #fff; }
        [data-theme='dark'] .action-btn:hover { background: #fff; color: #000; }
        .action-btn.edit:hover { background: #3b82f6; border-color: #3b82f6; color: #fff; }
        .action-btn.delete:hover { background: #ef4444; border-color: #ef4444; color: #fff; }

        .empty-state { padding: 5rem; text-align: center; }
        .empty-icon { color: #eee; margin-bottom: 1rem; }

        .animate-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
