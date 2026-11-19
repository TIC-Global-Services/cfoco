import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import { getLocalized } from '@/sanity/lib/localized';
import BlogPostClient from '@/components/blog/BlogPostClient';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 0;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { posts } = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | CFOCO',
    };
  }

  const postTitle = getLocalized(post.title, 'en');
  const postExcerpt = getLocalized(post.excerpt, 'en');
  const imageUrl =
    post.mainImage?.asset?.url ||
    (post.mainImage ? urlForImage(post.mainImage)?.url() : null) ||
    '/interior_bg.png';

  return {
    title: `${postTitle} | CFOCO Journal`,
    description: postExcerpt || 'Read this story on CFOCO Journal.',
    openGraph: {
      title: postTitle,
      description: postExcerpt || 'Read this story on CFOCO Journal.',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.mainImage?.alt || postTitle,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const { post } = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { posts: allPosts } = await getAllPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}
