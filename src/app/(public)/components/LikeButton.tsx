"use client";
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndStatus = async () => {
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [postId, supabase]);

  const handleLike = async () => {
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isLiked) {
        // Unlike
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
        // Like
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

  return (
    <button 
      className={`like-btn ${isLiked ? 'active' : ''} ${loading ? 'loading' : ''}`} 
      onClick={handleLike} 
      title={user ? (isLiked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
    >
      <Heart 
        size={20} 
        fill={isLiked ? "#ef4444" : "none"} 
        color={isLiked ? "#ef4444" : "currentColor"} 
        style={{ transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      />
      <span>{likes}</span>

      <style jsx>{`
        .like-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fff;
          border: 1px solid #eee;
          padding: 0.6rem 1.2rem;
          border-radius: 2rem;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
        }
        .like-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }
        .like-btn.active {
          border-color: #ef4444;
          background: #fff5f5;
          color: #ef4444;
        }
        .like-btn.loading {
          opacity: 0.7;
          cursor: wait;
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </button>
  );
}
