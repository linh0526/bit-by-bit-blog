'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function uploadImageIfPresent(supabase: any, formData: FormData): Promise<string> {
  const imageFile = formData.get('imageFile') as File | null;
  let finalImageUrl = formData.get('imageUrl') as string || '';

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile);
      
    if (uploadError) {
      console.error('SERVER: Error uploading image:', uploadError);
      throw new Error('Lỗi upload ảnh (Bạn đã tạo bucket "images" public trên Supabase chưa?): ' + uploadError.message);
    }
    
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    finalImageUrl = data.publicUrl;
  }
  
  return finalImageUrl;
}

export async function createPost(formData: FormData) {
  const supabase = createAdminClient()

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const priority = parseInt(formData.get('priority') as string || '0', 10)
  const rawTags = formData.get('tags') as string || '';
  const tags = rawTags ? rawTags.split(',').map(tag => tag.trim()).filter(Boolean) : []
  
  const seoTitle = formData.get('seoTitle') as string || ''
  const seoDescription = formData.get('seoDescription') as string || ''
  const imageAlt = formData.get('imageAlt') as string || title || ''
  const seoOgImage = formData.get('seoOgImage') as string || ''
  
  let imageUrl = '';
  try {
    imageUrl = await uploadImageIfPresent(supabase, formData);
  } catch (err: any) {
    return { error: err.message };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([
      { 
        title, 
        slug, 
        excerpt, 
        content, 
        category, 
        priority,
        tags, 
        image_url: imageUrl,
        seo_title: seoTitle,
        seo_description: seoDescription,
        image_alt: imageAlt,
        seo_og_image: seoOgImage,
        created_at: new Date().toISOString()
      }
    ])

  if (error) {
    console.error('SERVER: Error creating post:', error)
    return { error: error.message }
  }

  console.log(`SERVER: Post created successfully: ${slug}`)
  revalidatePath('/admin')
  revalidatePath('/admin/posts')
  revalidatePath('/')
  redirect('/admin/posts')
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = createAdminClient()

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const priority = parseInt(formData.get('priority') as string || '0', 10)
  const rawTags = formData.get('tags') as string || '';
  const tags = rawTags ? rawTags.split(',').map(tag => tag.trim()).filter(Boolean) : []
  
  const seoTitle = formData.get('seoTitle') as string || ''
  const seoDescription = formData.get('seoDescription') as string || ''
  const imageAlt = formData.get('imageAlt') as string || title || ''
  const seoOgImage = formData.get('seoOgImage') as string || ''
  
  let imageUrl = formData.get('imageUrl') as string;
  try {
    const uploadedUrl = await uploadImageIfPresent(supabase, formData);
    if (uploadedUrl) imageUrl = uploadedUrl;
  } catch (err: any) {
    return { error: err.message };
  }

  const { data, error } = await supabase
    .from('posts')
    .update({ 
      title, 
      slug, 
      excerpt, 
      content, 
      category, 
      priority,
      tags, 
      image_url: imageUrl,
      seo_title: seoTitle,
      seo_description: seoDescription,
      image_alt: imageAlt,
      seo_og_image: seoOgImage
    })
    .eq('id', id)

  if (error) {
    console.error('SERVER: Error updating post:', error)
    return { error: error.message }
  }

  console.log(`SERVER: Post updated successfully: ${id}`)
  revalidatePath('/admin')
  revalidatePath('/admin/posts')
  revalidatePath('/')
  redirect('/admin/posts')
}

export async function deletePost(id: string) {
  const supabase = createAdminClient()

  console.log(`SERVER: Attempting to delete post with ID: ${id}`)
  
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    console.error('SERVER: Error deleting post:', error)
    return { success: false, error: error.message }
  }

  if (!data || data.length === 0) {
    console.warn(`SERVER: No post found with ID ${id} or permission denied (RLS).`)
    return { success: false, error: "Không tìm thấy bài viết hoặc bạn không có quyền xoá (RLS Policy)." }
  }

  console.log(`SERVER: Post ${id} deleted successfully. Revalidating paths...`)
  revalidatePath('/admin')
  revalidatePath('/admin/posts')
  revalidatePath('/')
  
  return { success: true }
}

export async function renameCategory(oldName: string, newName: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('posts')
    .update({ category: newName })
    .eq('category', oldName)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/taxonomies'); revalidatePath('/');
  return { success: true }
}

export async function deleteCategory(name: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('posts')
    .update({ category: 'UNASSIGNED' })
    .eq('category', name)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/taxonomies'); revalidatePath('/');
  return { success: true }
}

export async function toggleCategoryVisibility(name: string, isHidden: boolean) {
  const supabase = createAdminClient()
  const cleanName = name.replace('[HIDDEN] ', '');
  const newName = isHidden ? cleanName : `[HIDDEN] ${cleanName}`;
  
  const { error } = await supabase
    .from('posts')
    .update({ category: newName })
    .eq('category', name)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/taxonomies'); revalidatePath('/');
  return { success: true }
}

export async function renameTag(oldTag: string, newTag: string) {
  const supabase = createAdminClient()
  // Tag handling is more complex due to array column
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, tags')
    .contains('tags', [oldTag])

  if (fetchError || !posts) return { success: false, error: fetchError?.message }

  const updates = posts.map(post => {
    const newTags = post.tags.map((t: string) => t === oldTag ? newTag : t);
    return supabase.from('posts').update({ tags: newTags }).eq('id', post.id);
  });

  await Promise.all(updates);
  revalidatePath('/admin/taxonomies'); revalidatePath('/');
  return { success: true }
}

export async function deleteTag(tag: string) {
  const supabase = createAdminClient()
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, tags')
    .contains('tags', [tag])

  if (fetchError || !posts) return { success: false, error: fetchError?.message }

  const updates = posts.map(post => {
    const newTags = post.tags.filter((t: string) => t !== tag);
    return supabase.from('posts').update({ tags: newTags }).eq('id', post.id);
  });

  await Promise.all(updates);
  revalidatePath('/admin/taxonomies'); revalidatePath('/');
  return { success: true }
}

export async function toggleTagVisibility(tag: string, isHidden: boolean) {
  const cleanTag = tag.replace('[HIDDEN] ', '');
  const newTag = isHidden ? cleanTag : `[HIDDEN] ${cleanTag}`;
  return renameTag(tag, newTag);
}

export async function incrementView(slug?: string) {
  const supabase = createAdminClient()
  
  if (slug) {
    // 1. Try RPC increment_post_views (atomic, efficient)
    const { error: rpcError } = await supabase.rpc('increment_post_views', { p_slug: slug });
    
    if (rpcError) {
      console.warn(`SERVER: RPC increment_post_views failed for ${slug}, trying direct update:`, rpcError);
      // Fallback: direct update
      const { data: post } = await supabase.from('posts').select('view_count').eq('slug', slug).single();
      if (post) {
        await supabase.from('posts').update({ view_count: (post.view_count || 0) + 1 }).eq('slug', slug);
      }
    }
  }

  // 2. Increment global total views
  const { error: globalRpcError } = await supabase.rpc('increment_total_views');
  if (globalRpcError) {
    console.warn('SERVER: RPC increment_total_views failed, trying direct update:', globalRpcError);
    const { data: stats } = await supabase.from('site_stats').select('value').eq('key', 'total_views').single();
    if (stats) {
      await supabase.from('site_stats').update({ value: (stats.value || 0) + 1 }).eq('key', 'total_views');
    }
  }
  
  revalidatePath('/')
  revalidatePath(`/${slug}`)
}

export async function syncPostLikes(postId: string) {
  const supabase = createAdminClient()
  
  // Get exact count from post_likes table
  const { count, error: countError } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (countError) return { success: false, error: countError.message };

  // Update denormalized count in posts table
  const { error: updateError } = await supabase
    .from('posts')
    .update({ likes_count: count || 0 })
    .eq('id', postId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath('/')
  return { success: true, count };
}
