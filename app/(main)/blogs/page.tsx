import React from 'react';
import type { Metadata } from 'next';
import { getAllPosts } from '@/sanity/lib/client';
import BlogListClient from '@/components/blog/BlogListClient';
import BlogHeader from '@/components/blog/BlogHeader';
import Reveal from '@/reusable/Reveal';

export const metadata: Metadata = {
  title: 'News & Blogs | CFOCO',
  description:
    'Explore the latest stories, single-origin sourcing journeys, brewing craftsmanship, and cultural chronicles from CFOCO.',
  openGraph: {
    title: 'News & Blogs | CFOCO',
    description:
      'Explore the latest stories, single-origin sourcing journeys, brewing craftsmanship, and cultural chronicles from CFOCO.',
  },
};

// Fresh content on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewsBlogsPage() {
  const { posts, isLive } = await getAllPosts();

  return (
    <div className="relative z-10 w-full flex-1 flex flex-col">
      {/* Header Section */}
      <section className="relative px-6 sm:px-10 lg:px-16 pt-12 pb-16 max-w-7xl mx-auto w-full">
        <BlogHeader />

        {/* Dynamic Blog Grid & Filters */}
        <Reveal>
          <BlogListClient initialPosts={posts} isLive={isLive} />
        </Reveal>
      </section>
    </div>
  );
}
