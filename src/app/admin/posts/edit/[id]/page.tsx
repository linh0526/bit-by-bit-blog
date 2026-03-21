import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import PostForm from "../../../components/PostForm";
import { notFound } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    console.error('Error fetching post for edit:', error);
    return notFound();
  }

  return <PostForm initialData={post} isEdit={true} />;
}
