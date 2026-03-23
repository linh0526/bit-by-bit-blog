"use client";
import React, { useState, useEffect } from "react";
import { Heart, Share2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface PostInteractionsProps {
  postId: string;
  initialLikes: number;
  postTitle: string;
}

export default function PostInteractions({ postId, initialLikes, postTitle }: PostInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndStatus = async () => {
      // Fetch current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch actual like count to ensure syncing with DB
      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: 'exact', head: true })
        .eq("post_id", postId);
      
      if (count !== null) setLikes(count);

      if (user) {
        // Check if user already liked this post
        const { data } = await supabase
          .from("post_likes")
          .select("*")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .single();
        setIsLiked(!!data);
      }
    };
    fetchUserAndStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [postId, supabase]);

  const handleLike = async () => {
    if (!user) {
      const next = window.location.pathname + window.location.search;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` 
        }
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isLiked) {
        // Unlike: Remove from post_likes
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        
        if (!error) {
          const newLikes = Math.max(0, likes - 1);
          setLikes(newLikes);
          setIsLiked(false);
          // Try to update denormalized count (best effort)
          await supabase.from('posts').update({ likes_count: newLikes }).eq('id', postId);
        }
      } else {
        // Like: Insert into post_likes
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        
        if (!error) {
          const newLikes = likes + 1;
          setLikes(newLikes);
          setIsLiked(true);
          // Try to update denormalized count (best effort)
          await supabase.from('posts').update({ likes_count: newLikes }).eq('id', postId);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: postTitle, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="post-interactions-row">
      <button 
        className={`like-btn ${isLiked ? 'active' : ''} ${loading ? 'loading' : ''}`} 
        onClick={handleLike}
      >
        <Heart 
          size={20} 
          fill={isLiked ? "#ef4444" : "none"} 
          color={isLiked ? "#ef4444" : "currentColor"} 
          style={{ transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
        />
        <span>{likes}</span>
      </button>

      <button className="share-btn-minimal" onClick={handleShare}>
        <Share2 size={18} />
        <span>CHIA SẺ</span>
      </button>

      <style jsx>{`
        .post-interactions-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin: 5rem 0;
          padding: 2.5rem 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }
        .like-btn, .share-btn-minimal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fff;
          border: 1px solid #eee;
          padding: 0.8rem 1.8rem;
          border-radius: 0.5rem;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #000;
        }
        .like-btn:hover, .share-btn-minimal:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          border-color: #ddd;
        }
        .like-btn.active {
          border-color: #ef4444;
          background: #fff5f5;
          color: #ef4444;
        }
        .share-btn-minimal {
          background: #000;
          color: #fff;
          border-color: #000;
          letter-spacing: 0.1em;
        }
        .share-btn-minimal:hover {
          background: #333;
          border-color: #333;
        }
        .like-btn.loading {
          opacity: 0.7;
          cursor: wait;
        }
      `}</style>
    </div>
  );
}
