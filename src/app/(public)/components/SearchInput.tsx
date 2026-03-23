'use client';

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const [value, setValue] = useState(q || '');

  useEffect(() => {
    setValue(q || '');
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/?q=${encodeURIComponent(value.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="header-search-form">
      <input 
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm..." 
        className="header-search-input"
      />
      <button type="submit" className="search-btn-icon">
        <Search size={16} />
      </button>

      <style jsx>{`
        .header-search-form {
          position: relative;
          display: flex;
          align-items: center;
          margin-right: 0.5rem;
        }
        .header-search-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          padding: 0.4rem 1rem 0.4rem 2.5rem;
          color: #ffffff;
          font-size: 0.85rem;
          width: 140px;
          transition: all 0.3s ease;
          outline: none;
        }
        .header-search-input:focus {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          width: 240px;
        }
        .search-btn-icon {
          position: absolute;
          left: 0.8rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .header-search-input:focus + .search-btn-icon {
          color: #ffffff;
        }
        
        @media (max-width: 768px) {
          .header-search-input {
            width: 100px;
          }
          .header-search-input:focus {
            width: 160px;
          }
        }
      `}</style>
    </form>
  );
}
