'use client'

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  FolderTree, 
  Tags, 
  FileText,
  ArrowRight,
  Hash,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  RefreshCcw
} from "lucide-react";
import { 
  renameCategory, 
  deleteCategory, 
  toggleCategoryVisibility,
  renameTag,
  deleteTag,
  toggleTagVisibility 
} from "@/app/lib/actions";

export default function TaxonomiesManagement() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [categories, setCategories] = useState<[string, number][]>([]);
  const [tags, setTags] = useState<[string, number][]>([]);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: posts, error } = await supabase
      .from('posts')
      .select('category, tags');

    if (error) {
       console.error(error);
       setLoading(false);
       return;
    }

    const categoryMap: Record<string, number> = {};
    const tagMap: Record<string, number> = {};

    posts.forEach(post => {
      if (post.category) {
        const cat = post.category;
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      }
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag) {
             tagMap[tag] = (tagMap[tag] || 0) + 1;
          }
        });
      }
    });

    setCategories(Object.entries(categoryMap).sort((a, b) => b[1] - a[1]));
    setTags(Object.entries(tagMap).sort((a, b) => b[1] - a[1]));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenameCat = async (oldName: string) => {
    const cleanName = oldName.replace('[HIDDEN] ', '');
    const newName = window.prompt(`Nhập tên mới cho danh mục "${cleanName}":`, cleanName);
    if (!newName || newName === cleanName) return;
    
    setProcessing(oldName);
    const finalNewName = oldName.includes('[HIDDEN]') ? `[HIDDEN] ${newName.toUpperCase()}` : newName.toUpperCase();
    await renameCategory(oldName, finalNewName);
    await fetchData();
    setProcessing(null);
  };

  const handleToggleCat = async (name: string) => {
    setProcessing(name);
    const isHidden = name.includes('[HIDDEN]');
    await toggleCategoryVisibility(name, isHidden);
    await fetchData();
    setProcessing(null);
  };

  const handleDeleteCat = async (name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xoá danh mục "${name.replace('[HIDDEN] ', '')}"? Các bài viết sẽ được chuyển về "UNASSIGNED".`)) return;
    setProcessing(name);
    await deleteCategory(name);
    await fetchData();
    setProcessing(null);
  };

  const handleRenameTag = async (oldTag: string) => {
    const cleanTag = oldTag.replace('[HIDDEN] ', '');
    const newTag = window.prompt(`Nhập tên mới cho tag "${cleanTag}":`, cleanTag);
    if (!newTag || newTag === cleanTag) return;
    
    setProcessing(oldTag);
    const finalNewTag = oldTag.includes('[HIDDEN]') ? `[HIDDEN] ${newTag.toLowerCase()}` : newTag.toLowerCase();
    await renameTag(oldTag, finalNewTag);
    await fetchData();
    setProcessing(null);
  };

  const handleToggleTag = async (tag: string) => {
    setProcessing(tag);
    const isHidden = tag.includes('[HIDDEN]');
    await toggleTagVisibility(tag, isHidden);
    await fetchData();
    setProcessing(null);
  };

  const handleDeleteTag = async (tag: string) => {
    if (!window.confirm(`Bạn có chắc muốn xoá tag "${tag.replace('[HIDDEN] ', '')}" khỏi tất cả bài viết?`)) return;
    setProcessing(tag);
    await deleteTag(tag);
    await fetchData();
    setProcessing(null);
  };

  if (loading) {
     return <div className="loading-state"><Loader2 className="spinner" size={40} /> <p>Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className="taxonomies-page animate-in">
      <div className="page-header">
        <div className="header-info">
          <span className="badge-pulse">Taxonomies Premium</span>
          <h1 className="page-title">QUẢN LÝ DANH MỤC & TAGS</h1>
          <p className="page-sub">Chỉnh sửa, ẩn hoặc xoá cấu trúc phân loại của blog</p>
        </div>
        <button className="refresh-btn" onClick={fetchData} title="Làm mới">
           <RefreshCcw size={18} />
        </button>
      </div>

      <div className="tax-grid">
        {/* CATEGORIES CARD */}
        <div className="tax-card">
          <div className="tax-card-header">
            <div className="tax-icon-box blue">
              <FolderTree size={20} />
            </div>
            <div>
              <h2 className="tax-card-title">DANH MỤC (CATEGORIES)</h2>
              <p className="tax-card-sub">{categories.length} danh mục hiện có</p>
            </div>
          </div>
          
          <div className="tax-list">
            {categories.map(([cat, count]) => {
              const isHidden = cat.includes('[HIDDEN]');
              const displayName = cat.replace('[HIDDEN] ', '');
              return (
                <div key={cat} className={`tax-item ${isHidden ? 'is-hidden' : ''}`}>
                  <div className="tax-item-info">
                    <span className="tax-name cat-badge">{displayName}</span>
                    {isHidden && <span className="hidden-label"><EyeOff size={10} /> ĐÃ ẨN</span>}
                  </div>
                  <div className="tax-item-actions">
                     <span className="count-badge">{count}</span>
                     <div className="action-btns">
                        <button onClick={() => handleRenameCat(cat)} className="icon-btn" title="Đổi tên"><Edit2 size={14} /></button>
                        <button onClick={() => handleToggleCat(cat)} className="icon-btn" title={isHidden ? "Hiện" : "Ẩn"}>
                           {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => handleDeleteCat(cat)} className="icon-btn delete" title="Xoá"><Trash2 size={14} /></button>
                     </div>
                  </div>
                  {processing === cat && <div className="item-overlay"><Loader2 className="spinner" size={20} /></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* TAGS CARD */}
        <div className="tax-card">
          <div className="tax-card-header">
            <div className="tax-icon-box purple">
              <Tags size={20} />
            </div>
            <div>
              <h2 className="tax-card-title">THẺ PHÂN LOẠI (TAGS)</h2>
              <p className="tax-card-sub">{tags.length} thẻ hiện có</p>
            </div>
          </div>
          
          <div className="tax-list">
             {tags.map(([tag, count]) => {
               const isHidden = tag.includes('[HIDDEN]');
               const displayName = tag.replace('[HIDDEN] ', '');
               return (
                 <div key={tag} className={`tax-item tag-row ${isHidden ? 'is-hidden' : ''}`}>
                   <div className="tax-item-info">
                     <Hash size={14} className="hash-icon" />
                     <span className="tax-name">{displayName}</span>
                     {isHidden && <span className="hidden-label">ẨN</span>}
                   </div>
                   <div className="tax-item-actions">
                      <span className="count-mini">{count}</span>
                      <div className="action-btns">
                        <button onClick={() => handleRenameTag(tag)} className="icon-btn" title="Đổi tên"><Edit2 size={14} /></button>
                        <button onClick={() => handleToggleTag(tag)} className="icon-btn" title={isHidden ? "Hiện" : "Ẩn"}>
                           {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => handleDeleteTag(tag)} className="icon-btn delete" title="Xoá"><Trash2 size={14} /></button>
                      </div>
                   </div>
                   {processing === tag && <div className="item-overlay"><Loader2 className="spinner" size={20} /></div>}
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .taxonomies-page { display: flex; flex-direction: column; gap: 3rem; padding-bottom: 5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 2rem; border-bottom: 1px solid #eee; }
        .badge-pulse { font-size: 0.625rem; font-weight: 900; letter-spacing: 0.3em; color: #9333ea; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
        .page-title { font-size: 2.25rem; font-weight: 900; letter-spacing: -0.05em; }
        .page-sub { color: #888; font-size: 0.9rem; margin-top: 0.5rem; }
        .refresh-btn { background: none; border: 1px solid #eee; width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: all 0.2s; }
        .refresh-btn:hover { background: #000; color: #fff; border-color: #000; }

        .tax-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
        .tax-card { background: #fff; border: 1px solid #eee; border-radius: 2rem; padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; }
        .tax-card-header { display: flex; align-items: center; gap: 1.5rem; border-bottom: 1px dashed #eee; padding-bottom: 2rem; }
        
        .tax-icon-box { width: 3.5rem; height: 3.5rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tax-icon-box.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .tax-icon-box.purple { background: rgba(147, 51, 234, 0.1); color: #9333ea; }
        
        .tax-card-title { font-size: 0.85rem; font-weight: 900; letter-spacing: 0.15em; color: #555; margin-bottom: 0.25rem; }
        .tax-card-sub { font-size: 0.75rem; color: #999; font-weight: 600; }

        .tax-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .tax-item { 
          display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; 
          background: #fafafa; border: 1px solid #f0f0f0; border-radius: 1.25rem; 
          transition: all 0.2s; position: relative;
        }
        .tax-item.is-hidden { opacity: 0.6; background: #f0f0f0; border-style: dashed; }
        .tax-item:hover { border-color: #000; background: #fff; transform: translateX(5px); }

        .tax-item-info { display: flex; align-items: center; gap: 1rem; }
        .tax-name { font-weight: 800; font-size: 0.95rem; }
        .cat-badge { font-size: 0.7rem; letter-spacing: 0.1em; background: rgba(0,0,0,0.05); padding: 0.4rem 1rem; border-radius: 2rem; }
        .hidden-label { font-size: 0.6rem; font-weight: 900; background: #000; color: #fff; padding: 0.2rem 0.5rem; border-radius: 0.4rem; display: flex; align-items: center; gap: 0.2rem; }

        .tax-item-actions { display: flex; align-items: center; gap: 1.5rem; }
        .count-badge { font-size: 0.75rem; font-weight: 900; background: #eee; min-width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; border-radius: 0.75rem; padding: 0 0.5rem; }
        .count-mini { font-size: 0.7rem; font-weight: 700; color: #aaa; }
        
        .action-btns { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.2s; }
        .tax-item:hover .action-btns { opacity: 1; }
        .icon-btn { width: 2.25rem; height: 2.25rem; border-radius: 0.75rem; border: 1px solid #eee; background: #fff; color: #666; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .icon-btn:hover { background: #000; color: #fff; border-color: #000; }
        .icon-btn.delete:hover { background: #ef4444; border-color: #ef4444; }

        .item-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; z-index: 10; }
        .loading-state { height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #999; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 1200px) {
          .tax-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}
