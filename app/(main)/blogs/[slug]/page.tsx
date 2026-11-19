import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import { getLocalized } from '@/sanity/lib/localized';
import BlogPostClient from '@/components/blog/BlogPostClient';
import JsonLd from '@/components/seo/JsonLd';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 0;
export const dynamicParams = true;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cfoco.com';

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
    '/fried-chickens.png';

  const title = `${postTitle} | CFOCO Journal`;
  const description = postExcerpt || 'Read this story on the CFOCO Journal.';

  return {
    title,
    description,
    alternates: {
      canonical: `/blogs/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blogs/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.mainImage?.alt || postTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
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

  const postTitle = getLocalized(post.title, 'en');
  const postExcerpt = getLocalized(post.excerpt, 'en');
  const imageUrl =
    post.mainImage?.asset?.url ||
    (post.mainImage ? urlForImage(post.mainImage)?.url() : null) ||
    `${siteUrl}/fried-chickens.png`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postTitle,
    description: postExcerpt,
    image: imageUrl,
    datePublished: post.publishedAt || new Date().toISOString(),
    dateModified: post.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'CFOCO Editorial Team',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CFOCO',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blogs/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blogs',
        item: `${siteUrl}/blogs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: postTitle,
        item: `${siteUrl}/blogs/${slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} />
      <BlogPostClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
