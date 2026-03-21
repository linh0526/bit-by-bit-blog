'use client'

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  Settings,
  Plus,
  FileText,
  Link as LinkIcon,
  Bold,
  Italic,
  List as ListIcon,
  Code,
  CheckCircle2,
  AlertCircle,
  AlignCenter,
  Heading2,
  Heading3,
  Heading4,
  Type
} from "lucide-react";
import { createPost, updatePost } from "../../lib/actions"
import { createClient } from "@/utils/supabase/client"

interface PostFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function PostForm({ initialData, isEdit }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  const generateSlug = (title: string) => {
    const s = title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(s);
  };

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;
    
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    setContent(newText);
    textarea.value = newText;
    textarea.focus();
    
    setTimeout(() => {
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/^##\s+(.*)/gm, (_, title) => `<h2 style="font-size: 1.8rem; font-weight: 800; margin-top: 2rem;">${title}</h2>`)
      .replace(/^###\s+(.*)/gm, (_, title) => `<h3 style="font-size: 1.4rem; font-weight: 700; margin-top: 1.5rem;">${title}</h3>`)
      .replace(/^####\s+(.*)/gm, (_, title) => `<h4 style="font-size: 1.1rem; font-weight: 700; margin-top: 1.25rem;">${title}</h4>`)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 1rem; display: block;" />')
      .replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align: center;">$1</div>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #9333ea; text-decoration: underline;">$1</a>')
      .replace(/^\s*-\s+(.*)/gm, '<li style="margin-left: 1.5rem;">$1</li>')
      .split(/\n+/)
      .filter((para) => para.trim())
      .map((para) => {
        if (para.startsWith('<h') || para.startsWith('<li') || para.startsWith('<div')) return para;
        return `<p>${para}</p>`;
      })
      .join('');
  };

  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await createClient().from('posts').select('category');
      if (data) {
        const cats = Array.from(new Set(data.map((p: any) => p.category?.toUpperCase()).filter(Boolean)));
        setExistingCategories(cats as string[]);
      }
    };
    fetchCategories();
  }, []);

  const formAction = isEdit ? updatePost.bind(null, initialData.id) : createPost;

  return (
    <div className="post-form-container animate-in select-text-root">
      <div className="form-header">
        <div className="header-breadcrumbs">
          <a href="/admin/posts" className="back-link">
            <ArrowLeft size={14} /> HUỶ & QUAY LẠI
          </a>
          <h1 className="form-title">
            {isEdit ? "Chỉnh sửa" : "Tạo bài viết mới"}
          </h1>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <p className="label">Trạng thái</p>
            <p className="status active"><CheckCircle2 size={14} /> Online</p>
          </div>
          <button type="button" className={`btn-secondary ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab(activeTab === 'write' ? 'preview' : 'write')}>
            <Eye size={18} /> {activeTab === 'write' ? "Xem trước" : "Giao diện viết"}
          </button>
        </div>
      </div>

      <form 
        action={(formData) => {
          setLoading(true);
          formAction(formData);
        }}
        className="post-form-grid"
      >
        <div className="editor-main">
          <div className="input-group-title">
             <input 
               name="title" 
               type="text" 
               defaultValue={initialData?.title}
               onChange={(e) => !isEdit && generateSlug(e.target.value)}
               placeholder="Tiêu đề bài viết..." 
               className="title-input select-text-root"
               required
             />
             <textarea 
               name="excerpt" 
               defaultValue={initialData?.excerpt}
               placeholder="Mô tả ngắn" 
               className="excerpt-textarea-minimal select-text-root"
               required
             />
          </div>

          <div className="editor-card glass-morph">
            <div className="editor-toolbar">
              <div className="tab-switcher">
                <button type="button" className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>VIẾT</button>
                <button type="button" className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>XEM TRƯỚC</button>
              </div>

              {activeTab === 'write' && (
                <div className="formatting-toolbar">
                   <div className="tool-group">
                     <button type="button" className="tool-btn" onClick={() => insertText('## ', '', 'Tiêu đề')} title="Heading 2"><Heading2 size={18} /></button>
                     <button type="button" className="tool-btn" onClick={() => insertText('### ', '', 'Tiêu đề')} title="Heading 3"><Heading3 size={18} /></button>
                     <button type="button" className="tool-btn" onClick={() => insertText('#### ', '', 'Tiêu đề')} title="Heading 4"><Heading4 size={18} /></button>
                   </div>
                   <div className="tool-divider"></div>
                   <div className="tool-group">
                     <button type="button" className="tool-btn" onClick={() => insertText('**', '**', 'bold')} title="In đậm"><Bold size={18} /></button>
                     <button type="button" className="tool-btn" onClick={() => insertText('*', '*', 'italic')} title="In nghiêng"><Italic size={18} /></button>
                     <button type="button" className="tool-btn" onClick={() => insertText('[center]', '[/center]', 'Căn giữa')} title="Căn giữa"><AlignCenter size={18} /></button>
                   </div>
                   <div className="tool-divider"></div>
                   <div className="tool-group">
                     <button type="button" className="tool-btn" onClick={() => insertText('![', '](url)', 'Mô tả ảnh')} title="Chèn ảnh"><ImageIcon size={18} /></button>
                     <button type="button" className="tool-btn" onClick={() => insertText('[', '](url)', 'link text')} title="Chèn Link"><LinkIcon size={18} /></button>
                     <button type="button" className="tool-btn" onClick={() => insertText('- ', '', 'list')} title="Danh sách"><ListIcon size={18} /></button>
                   </div>
                </div>
              )}
            </div>

            <div className="editor-view-container">
              {activeTab === 'write' ? (
                <textarea 
                  name="content" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="content-textarea select-text-root"
                  placeholder="Bắt đầu câu chuyện của bạn..."
                  required
                />
              ) : (
                <article className="preview-area markdown-body selection-fix" dangerouslySetInnerHTML={{ __html: renderPreview(content) }} />
              )}
            </div>
          </div>
        </div>

        <div className="editor-sidebar">
          <div className="sidebar-inner-sticky">
            <div className="sidebar-card">
              <h3 className="sidebar-title"><Settings size={20} /> Thiết lập</h3>
              
              <div className="config-item">
                <label className="config-label">Slug (URL)</label>
                <input name="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="config-input" required />
              </div>

              <div className="config-item">
                <label className="config-label">Độ ưu tiên (Priority)</label>
                <input name="priority" type="number" defaultValue={initialData?.priority || 0} className="config-input" />
                <p className="input-hint">Số cao hơn hiện trước. Giới thiệu (About) nên để -1.</p>
              </div>

              <div className="config-item">
                <label className="config-label">Danh mục</label>
                <input 
                  name="category" 
                  defaultValue={initialData?.category || "INSIGHT"} 
                  className="config-input" 
                  list="category-suggestions"
                  placeholder="Chọn hoặc nhập mới..."
                />
                <datalist id="category-suggestions">
                  {["INSIGHT", "LIFE", "TECH", ...existingCategories].filter((v, i, a) => a.indexOf(v) === i).map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="input-hint">Gợi ý: INSIGHT, TECH, LIFE...</p>
              </div>

              <div className="config-item">
                <label className="config-label">Thẻ (Tags)</label>
                <input 
                  name="tags" 
                  type="text" 
                  defaultValue={initialData?.tags?.join(', ') || ""} 
                  placeholder="Ví dụ: AI, Coding, Design" 
                  className="config-input" 
                />
                <p className="input-hint">Ngăn cách mỗi tag bằng dấu phẩy</p>
              </div>

              <div className="config-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="config-label mandatory" style={{ margin: 0 }}>Ảnh bìa bài viết *</label>
                  <div className="image-mode-tabs">
                    <button type="button" className={`mode-btn ${imageMode === 'url' ? 'active' : ''}`} onClick={() => setImageMode('url')}>Link</button>
                    <button type="button" className={`mode-btn ${imageMode === 'upload' ? 'active' : ''}`} onClick={() => setImageMode('upload')}>Upload</button>
                  </div>
                </div>

                <input 
                  name="imageUrl" 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="Dán link ảnh tại đây..."
                  className="config-input" 
                  style={{ display: imageMode === 'url' ? 'block' : 'none' }}
                />

                <input 
                  name="imageFile" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImageUrl(URL.createObjectURL(file));
                  }}
                  className="config-input file-input" 
                  style={{ display: imageMode === 'upload' ? 'block' : 'none' }}
                />
                
                <p className="input-hint">Mỗi bài viết đều phải có ảnh bìa để hiển thị.</p>
                
                {(imageUrl && !imageUrl.startsWith('blob:')) || (imageUrl.startsWith('blob:') && imageMode === 'upload') ? (
                  <div className="image-preview-box">
                    <img src={imageUrl} alt="Preview" className="img-preview" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="sidebar-card guide-card">
              <h3 className="sidebar-title"><Code size={20} /> Cú pháp bài viết</h3>
              <ul className="guide-list">
                <li><strong>In đậm:</strong> <code>**nội dung**</code></li>
                <li><strong>In nghiêng:</strong> <code>*nội dung*</code></li>
                <li><strong>Heading:</strong> <code>## Tiêu đề H2</code> <span>hoặc</span> <code>### Tiêu đề H3</code></li>
                <li><strong>Chèn Ảnh:</strong> <code>![mô tả](url)</code></li>
                <li><strong>Chèn Link:</strong> <code>[tên web](https://url...)</code></li>
                <li><strong>Chèn Bullet:</strong> <code>- Mục danh sách</code></li>
                <li><strong>Căn giữa:</strong> <code>[center]nội dung...[/center]</code></li>
                <li><strong>Ngắt đoạn:</strong> <code>Nhấn Enter để tách Paragraph</code></li>
              </ul>
            </div>

            <div className="submit-box">
             {!imageUrl && (
               <div className="requirement-alert">
                 <AlertCircle size={14} /> <span>Vui lòng thêm ảnh bìa</span>
               </div>
             )}
             <button type="submit" disabled={loading || !imageUrl} className="btn-submit">
               {loading ? <Loader2 className="spinner" size={24} /> : <span>{isEdit ? "CẬP NHẬT" : "XUẤT BẢN"}</span>}
             </button>
            </div>
          </div>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .select-text-root, .select-text-root * { user-select: text !important; -webkit-user-select: text !important; cursor: auto !important; }
        .post-form-container { display: flex; flex-direction: column; gap: 3rem; }
        .form-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 2rem; }
        .form-title { font-size: 2.25rem; font-weight: 900; letter-spacing: -0.05em; }
        
        .post-form-grid { display: grid; grid-template-columns: 1fr 340px; gap: 4rem; max-width: 100%; box-sizing: border-box; }
        .editor-main { display: flex; flex-direction: column; gap: 2.5rem; max-width: 100%; min-width: 0; box-sizing: border-box; }
        .title-input { font-size: 3rem; font-weight: 900; background: none; border: none; outline: none; border-bottom: 1px solid #eee; padding-bottom: 1rem; width: 100%; box-sizing: border-box; }
        .excerpt-textarea-minimal { background: none; border: none; outline: none; font-size: 1.15rem; color: #666; resize: none; min-height: 4rem; margin-top: 1rem; width: 100%; box-sizing: border-box; }
        
        .editor-card { background: #fff; border: 1px solid #eee; border-radius: 2rem; overflow: hidden; min-height: 800px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
        .editor-toolbar { padding: 0.75rem 1.5rem; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; background: #fff; }
        [data-theme='dark'] .editor-toolbar { background: #0a0a0a; border-color: #1a1a1a; }
        .tab-switcher { display: flex; gap: 0.5rem; }
        .tab-btn { background: none; border: none; font-size: 0.7rem; font-weight: 800; color: #999; cursor: pointer; padding: 0.5rem 1rem; border-radius: 0.75rem; transition: all 0.2s; }
        .tab-btn.active { color: #000; background: #f0f0f0; }
        [data-theme='dark'] .tab-btn.active { color: #fff; background: #222; }
        
        .formatting-toolbar { display: flex; align-items: center; gap: 0.5rem; }
        .tool-group { display: flex; gap: 0.25rem; }
        .tool-divider { width: 1px; height: 1.5rem; background: #eee; margin: 0 0.5rem; }
        .tool-btn { width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; color: #555; transition: all 0.2s; background: none; border: none; cursor: pointer; }
        .tool-btn:hover { background: #f5f5f5; color: #000; }
        [data-theme='dark'] .tool-btn { color: #aaa; }
        [data-theme='dark'] .tool-btn:hover { background: #1a1a1a; color: #fff; }
        
        .editor-view-container { display: flex; flex-direction: column; flex-grow: 1; width: 100%; box-sizing: border-box; }
        .content-textarea { width: 100%; flex-grow: 1; border: none; padding: 3rem; background: transparent; font-family: 'Lora', serif; font-size: 1.35rem; line-height: 1.85; outline: none; resize: vertical; box-sizing: border-box; word-wrap: break-word; }
        .preview-area { padding: 3rem; overflow-y: auto; max-height: 1000px; box-sizing: border-box; word-wrap: break-word; width: 100%; font-family: 'Lora', serif; font-size: 1.35rem; line-height: 1.85; color: #222; }
        .preview-area p { margin-bottom: 2.5rem; }

        .sidebar-inner-sticky { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 2rem; }
        .sidebar-title { font-size: 1.15rem; font-weight: 900; letter-spacing: -0.02em; display: flex; align-items: center; gap: 0.75rem; border-bottom: 2px solid #000; padding-bottom: 1.5rem; }
        [data-theme='dark'] .sidebar-title { border-bottom-color: #fff; }
        .sidebar-card { background: #fff; border: 1px solid #eee; border-radius: 2.5rem; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        [data-theme='dark'] .sidebar-card { background: #000; border-color: #1a1a1a; }
        .config-label { font-size: 0.65rem; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.75rem; }
        .config-label.mandatory { color: #000; }
        [data-theme='dark'] .config-label.mandatory { color: #fff; }

        .config-input, .config-select { width: 100%; padding: 1rem; border: 1px solid #eee; border-radius: 1rem; outline: none; font-weight: 600; font-size: 0.9rem; }
        [data-theme='dark'] .config-input, [data-theme='dark'] .config-select { background: #111; border-color: #222; color: #fff; }
        
        .input-hint { font-size: 0.7rem; color: #999; margin-top: 0.5rem; }
        .image-preview-box { margin-top: 1.5rem; border-radius: 1rem; overflow: hidden; border: 1px solid #eee; background: #f9f9f9; }
        .img-preview { width: 100%; height: auto; display: block; }

        .image-mode-tabs { display: flex; gap: 0.5rem; }
        .mode-btn { background: #f0f0f0; border: none; font-size: 0.65rem; font-weight: 800; padding: 0.25rem 0.5rem; border-radius: 0.5rem; cursor: pointer; color: #888; text-transform: uppercase; }
        .mode-btn.active { background: #000; color: #fff; }
        [data-theme='dark'] .mode-btn { background: #222; color: #888; }
        [data-theme='dark'] .mode-btn.active { background: #fff; color: #000; }
        .file-input { padding: 0.75rem !important; }

        .guide-card { padding: 2rem !important; gap: 1rem !important; }
        .guide-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; padding: 0; margin: 0; font-size: 0.75rem; color: #555; }
        [data-theme='dark'] .guide-list { color: #aaa; }
        .guide-list li { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed #eee; padding-bottom: 0.5rem; }
        [data-theme='dark'] .guide-list li { border-bottom-color: #222; }
        .guide-list li:last-child { border-bottom: none; padding-bottom: 0; }
        .guide-list strong { color: #111; font-weight: 700; width: 40%; }
        [data-theme='dark'] .guide-list strong { color: #eee; }
        .guide-list code { background: #fdf2f8; padding: 0.35rem 0.5rem; border-radius: 0.4rem; font-size: 0.7rem; color: #db2777; font-family: monospace; }
        [data-theme='dark'] .guide-list code { background: #222; color: #f472b6; }
        .guide-list span { font-style: italic; font-size: 0.65rem; color: #aaa; margin: 0 0.5rem; }

        .requirement-alert { display: flex; align-items: center; gap: 0.5rem; background: rgba(239, 68, 68, 0.05); color: #ef4444; padding: 0.75rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: 700; margin-bottom: 1rem; }
        .btn-submit { width: 100%; background: #000; color: #fff; padding: 1.5rem; border-radius: 1.5rem; border: none; cursor: pointer; font-weight: 900; }
        .btn-submit:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
        [data-theme='dark'] .btn-submit { background: #fff; color: #000; }
        [data-theme='dark'] .btn-submit:disabled { background: #222; color: #555; }

        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
