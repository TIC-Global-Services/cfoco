import React from 'react';
import type { Metadata } from 'next';
import { getAllPosts } from '@/sanity/lib/client';
import BlogListClient from '@/components/blog/BlogListClient';
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
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e9b949]/30 bg-[#e9b949]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#e9b949] mb-6">
              <span>CFOCO Chronicles</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
              Stories from the{' '}
              <span className="bg-gradient-to-r from-white via-[#ffd67a] to-[#e9b949] bg-clip-text text-transparent">
                Heart of CFOCO
              </span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed">
              Explore our latest journeys through high-altitude origins, artisan roasting
              refinements, sensory cafe spaces, and culinary culture.
            </p>
          </div>
        </Reveal>

        {/* Dynamic Blog Grid & Filters */}
        <Reveal>
          <BlogListClient initialPosts={posts} isLive={isLive} />
        </Reveal>
      </section>
    </div>
  );
}
