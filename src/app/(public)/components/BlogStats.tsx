"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface BlogStatsProps {
  initialViews?: number;
  postSlug?: string;
}

export default function BlogStats({ initialViews, postSlug }: BlogStatsProps) {
  const [views, setViews] = useState(initialViews || 0);

  useEffect(() => {
    const handleStats = async () => {
      // 1. Check if user already counted in this session
      const hasViewed = document.cookie.split('; ').some((item) => item.trim().startsWith('bitbybit_v=1'));
      
      if (!hasViewed) {
        const { incrementView } = await import("../../lib/actions");
        await incrementView(postSlug);

        // Set cookie (30 mins)
        const d = new Date();
        d.setTime(d.getTime() + (30 * 60 * 1000)); 
        document.cookie = `bitbybit_v=1; expires=${d.toUTCString()}; path=/`;
        
        setViews(prev => prev + 1);
      }

      // Fetch dynamic total for visual accuracy if needed, 
      // but for premium feel we can just use the incremented state
    };

    handleStats();
  }, [postSlug]);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '0.35rem'
    }}>
      <span style={{
        fontSize: '0.8rem',
        color: '#000',
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }}>
        {views.toLocaleString('vi-VN')}
      </span>
      <span style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        color: '#bbb',
        textTransform: 'lowercase',
        letterSpacing: '0.02em'
      }}>
        lượt xem
      </span>
    </span>
  );
}
