'use client'

import React, { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePost } from '../../lib/actions'

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xoá bài viết này? Hành động này không thể hoàn tác.')) {
      startTransition(async () => {
        try {
          const res = await deletePost(id);
          if (res && !res.success) {
            alert(`Lỗi từ server: ${res.error}`);
          }
        } catch (error) {
          console.error("CLIENT: Unexpected error:", error);
          alert("Có lỗi không xác định xảy ra.");
        }
      });
    }
  }

  return (
    <>
      <button 
        type="button"
        onClick={handleDelete}
        className={`action-btn delete ${isPending ? 'pending' : ''}`} 
        title="Xoá bài viết"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 size={16} className="spinner-mini" />
        ) : (
          <Trash2 size={18} />
        )}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .spinner-mini {
          animation: spin 1s linear infinite;
          color: #ef4444;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .action-btn.delete.pending {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f9f9f9;
        }
        [data-theme='dark'] .action-btn.delete.pending {
          background: #111;
        }
      `}} />
    </>
  )
}
