"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, LogOut } from "lucide-react";

export default function UserStatus({ initialUser }: { initialUser: any }) {
  const [user, setUser] = useState<any>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };
    if (!initialUser) getSession();
    else setLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogin = async () => {
    const next = window.location.pathname + window.location.search;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
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
           <User size={18} />
           <span className="user-name-small">{user.user_metadata?.full_name || user.email}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn-icon" title="Đăng xuất">
          <LogOut size={16} />
        </button>
        <style jsx>{`
          .user-profile-nav { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem 0.25rem 1rem; border-radius: 2rem; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; color: #fff; }
          .user-info { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
          .user-name-small { font-size: 0.75rem; font-weight: 700; color: #fff; letter-spacing: 0.02em; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .logout-btn-icon { background: none; border: none; color: #666; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; padding: 0.2rem; }
          .logout-btn-icon:hover { color: #ff4d4d; }
          .user-loading { width: 40px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 2rem; }
        `}</style>
      </div>
    );
  }

  return null;
}
