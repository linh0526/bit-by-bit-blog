"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, LogOut } from "lucide-react";

export default function UserStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="user-loading" />;

  if (user) {
    return (
      <div className="user-profile-nav">
        <div className="user-info">
           {user.user_metadata?.avatar_url ? (
             <img src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} className="user-avatar-small" />
           ) : <User size={18} />}
           <span className="user-name-small">{user.user_metadata?.full_name || user.email}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn-icon" title="Đăng xuất">
          <LogOut size={16} />
        </button>
        <style jsx>{`
          .user-profile-nav { display: flex; align-items: center; gap: 1.5rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem 0.25rem 1rem; border-radius: 2rem; border: 1px solid rgba(255,255,255,0.1); }
          .user-info { display: flex; align-items: center; gap: 0.75rem; }
          .user-avatar-small { width: 24px; height: 24px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); }
          .user-name-small { font-size: 0.75rem; font-weight: 700; color: #fff; letter-spacing: 0.02em; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .logout-btn-icon { background: none; border: none; color: #666; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; }
          .logout-btn-icon:hover { color: #ff4d4d; }
          .user-loading { width: 100px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 2rem; animation: pulse 1.5s infinite; }
          @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
        `}</style>
      </div>
    );
  }

  return null;
}
