"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, User, MessageCircle } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndComments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const { data } = await supabase
        .from("comments")
        .select(`*`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      setComments(data || []);
      setInitialLoading(false);
    };
    fetchUserAndComments();
  }, [postId, supabase]);

  useEffect(() => {
    const draft = localStorage.getItem(`comment_draft_${postId}`);
    if (draft) {
      setContent(draft);
      localStorage.removeItem(`comment_draft_${postId}`);
    }
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    if (!user) {
      localStorage.setItem(`comment_draft_${postId}`, content);
      await loginWithGoogle();
      return;
    }

    setLoading(true);
    try {
      // For MVP, we insert metadata directly in the row or handle via profiles
      // We assume user_id, full_name, avatar_url are available or handled by post-processing
      const { data, error } = await supabase
        .from("comments")
        .insert([
          { 
            post_id: postId, 
            user_id: user.id, 
            content,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url
          }
        ])
        .select()
        .single();
      
      if (!error && data) {
        setComments(prev => [...prev, data]);
        setContent("");
      } else if (error) {
        console.error("Supabase Error:", error);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' }
    });
  };

  if (initialLoading) return <div className="loading-dots">Đang tải bình luận...</div>;

  return (
    <div className="comment-section">
      <div className="section-title">
         <MessageCircle size={23} /> 
         <span>ở đây có {comments.length} bình luận </span>
         
      </div>

      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-avatar">
               {comment.avatar_url ? (
                 <img src={comment.avatar_url} alt={comment.full_name} referrerPolicy="no-referrer" />
               ) : <div className="avatar-placeholder"><User size={20} /></div>}
            </div>
            <div className="comment-bubble">
              <div className="comment-header">
                <strong>{comment.full_name || 'Anonymous'}</strong>
                <span>{new Date(comment.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>}
      </div>

      <div className="comment-form-box">
        <form onSubmit={handleSubmit} className="comment-form">
          {user && (
            <div className="form-header">
               <span className="replying-as">Bình luận bằng <strong>{user.user_metadata?.full_name || user.email}</strong></span>
            </div>
          )}
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            disabled={loading}
            className="comment-textarea"
          />
          <button type="submit" className="submit-comment-btn" disabled={loading || !content.trim()}>
            <Send size={16} /> {loading ? 'Đang gửi...' : 'Đăng bình luận'}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .comment-section { margin-top: 6rem; padding-top: 8rem; border-top: 1px solid #eee; }
        .section-title { font-size: 1.3rem; font-weight: 800; color: #000; margin-bottom: 4rem; display: flex; align-items: center; gap: 1rem; letter-spacing: -0.02em; }
        
        .comment-list { display: flex; flex-direction: column; gap: 2.5rem; margin-bottom: 5rem; }
        .comment-item { display: flex; gap: 1.5rem; align-items: flex-start; }
        .comment-avatar img { width: 48px; height: 48px; border-radius: 0.5rem; object-fit: cover; border: 1px solid #eee; }
        .avatar-placeholder { width: 48px; height: 48px; border-radius: 0.5rem; background: #f9f9f9; display: flex; align-items: center; justify-content: center; color: #ddd; border: 1px solid #eee; }
        
        .comment-bubble { flex-grow: 1; position: relative; }
        .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .comment-header strong { font-size: 0.95rem; font-weight: 800; color: #000; }
        .comment-header span { font-size: 0.75rem; color: #bbb; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .comment-content { font-size: 1.1rem; line-height: 1.7; color: #333; margin: 0; white-space: pre-wrap; word-break: break-word; }
        
        .no-comments { text-align: center; color: #bbb; font-weight: 500; padding: 4rem 0; font-size: 1.1rem; background: #fafafa; border-radius: 1rem; border: 2px dashed #eee; }
        
        .comment-form-box { background: #fafafa; padding: 2.5rem; border-radius: 1rem; border: 1px solid #eee; }
        .form-header { margin-bottom: 1.5rem; }
        .replying-as { font-size: 0.8rem; color: #888; letter-spacing: 0.02em; }
        .replying-as strong { color: #000; }
        
        .comment-textarea { width: 100%; border: none; background: transparent; min-height: 120px; resize: vertical; font-size: 1.1rem; outline: none; display: block; margin-bottom: 1.5rem; color: #000; font-family: inherit; }
        .comment-textarea::placeholder { color: #bbb; }
        
        .comment-form { display: flex; flex-direction: column; align-items: flex-end; }
        .submit-comment-btn { display: flex; align-items: center; gap: 0.75rem; background: #000; color: #fff; border: none; padding: 0.8rem 2rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: 900; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.1em; }
        .submit-comment-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .submit-comment-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        
        .comment-login-promo { text-align: center; }
        .promo-text { font-size: 1.15rem; font-weight: 600; color: #888; margin-bottom: 2.5rem; line-height: 1.5; }
        .login-google-btn { background: #fff; color: #000; border: none; padding: 1.25rem 3rem; border-radius: 3rem; font-size: 0.9rem; font-weight: 900; letter-spacing: 0.15em; cursor: pointer; transition: all 0.3s; }
        .login-google-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2); }

        .loading-dots { font-size: 1rem; color: #bbb; text-align: center; width: 100%; padding: 4rem 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; animation: pulse-text 2s infinite; }
        @keyframes pulse-text { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}} />
    </div>
  );
}
