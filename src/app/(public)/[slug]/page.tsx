import { createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import TOCSidebar, { Heading } from "../components/TOCSidebar";
import PostContent from "../components/PostContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const adminSupabase = createAdminClient();
  
  const { data: post } = await adminSupabase
    .from('posts')
    .select('title, excerpt, image_url, seo_title, seo_description, seo_og_image')
    .eq('slug', slug)
    .single();

  if (!post) return { title: 'Bài viết không tồn tại' };

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const imageUrl = post.seo_og_image || post.image_url || "https://feyzwofpwuutgbuglaqi.supabase.co/storage/v1/object/public/blog-images/default-og.png";

  return {
    title: `${title.replace(/\[\/?center\]/g, '')} | Bit by Bit`,
    description: (description || '').replace(/\[\/?center\]/g, ''),
    openGraph: {
      title: title.replace(/\[\/?center\]/g, ''),
      description: (description || '').replace(/\[\/?center\]/g, ''),
      images: [imageUrl],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title.replace(/\[\/?center\]/g, ''),
      description: (description || '').replace(/\[\/?center\]/g, ''),
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const adminSupabase = createAdminClient();

  const { data: post, error } = await adminSupabase.from('posts').select('*').eq('slug', slug).single();

  if (error || !post) {
    console.error(`SERVER: Post not found or error for slug: ${slug}`, error);
    return notFound();
  }

  if (post.category?.includes('[HIDDEN]') || post.tags?.some((t: string) => t.includes('[HIDDEN]'))) {
    return notFound();
  }

  const { data: relatedPosts } = await adminSupabase.from('posts')
    .select('id, title, slug, created_at, category, image_url, likes_count, views_count')
    .eq('category', post.category).neq('id', post.id).not('category', 'ilike', '[HIDDEN]%').limit(3);

  const slugify = (text: string) => 
    text.toLowerCase()
      .replace(/\[\/?center\]/gi, '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

  const headings: Heading[] = (post.content || "").match(/^#{2,4}\s+(.*)/gm)?.map((h: string) => {
    const level = h.startsWith('####') ? 4 : h.startsWith('###') ? 3 : 2;
    const text = h.replace(/^#{2,4}\s+/, '').replace(/\[\/?center\]/g, '');
    return { level, text, id: slugify(text) };
  }) || [];

  const renderedContent = (post.content || "")
    .replace(/^##\s+(.*)/gm, (_: any, title: string) => `<h2 id="${slugify(title)}">${title}</h2>`)
    .replace(/^###\s+(.*)/gm, (_: any, title: string) => `<h3 id="${slugify(title)}">${title}</h3>`)
    .replace(/^####\s+(.*)/gm, (_: any, title: string) => `<h4 id="${slugify(title)}">${title}</h4>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async" style="max-width: 100%; border-radius: 1rem; margin: 2rem 0; display: block;" />')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/g, '<div style="text-align: center;">$1</div>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="content-link">$1</a>')
    .replace(/^\s*-\s+(.*)/gm, '<li style="margin-left: 1.5rem;">$1</li>')
    .split(/\n+/)
    .filter((para: string) => para.trim())
    .map((para: string) => {
      if (para.startsWith('<h') || para.startsWith('<li') || para.startsWith('<div')) return para;
      return `<p>${para}</p>`;
    })
    .join('');

  return (
    <>
      <TOCSidebar headings={headings} />
      <PostContent 
        post={post} 
        renderedContent={renderedContent} 
        relatedPosts={relatedPosts || []} 
        slug={slug} 
      />
    </>
  );
}
