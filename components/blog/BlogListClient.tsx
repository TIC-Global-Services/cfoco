'use client';

import React, { useState, useMemo } from 'react';
import { Post } from '@/sanity/lib/types';
import BlogCard from './BlogCard';
import { Search, Sparkles, SlidersHorizontal, Radio } from 'lucide-react';
import Link from 'next/link';

interface BlogListClientProps {
  initialPosts: Post[];
  isLive: boolean;
}

export default function BlogListClient({ initialPosts, isLive }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((post) => {
      post.categories?.forEach((cat) => {
        if (cat.title) set.add(cat.title);
      });
    });
    return ['All', ...Array.from(set)];
  }, [initialPosts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        post.categories?.some((c) => c?.title?.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [initialPosts, searchQuery, selectedCategory]);

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <div className="w-full">
      {/* Live / Demo Mode Banner */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLive ? 'bg-emerald-400' : 'bg-[#e9b949]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isLive ? 'bg-emerald-500' : 'bg-[#e9b949]'
                }`}
              />
            </span>
            <div>
              <p className="text-sm font-medium text-white flex items-center gap-2">
                {isLive ? (
                  <>
                    <span className="text-emerald-400 font-semibold">Live Sanity CMS</span>
                    <span className="text-xs text-neutral-400">— Dynamic content loaded from dataset</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#e9b949] font-semibold">Sanity Ready (Preview Mode)</span>
                    <span className="text-xs text-neutral-400">— Demonstrating sample blog data</span>
                  </>
                )}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isLive
                  ? 'All changes published in Sanity Studio reflect instantly.'
                  : 'Add your Project ID in .env.local and create articles in the Sanity Studio.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e9b949]/40 bg-[#e9b949]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#e9b949] transition hover:bg-[#e9b949] hover:text-black"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Sanity Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-12 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? 'border border-[#e9b949] bg-[#e9b949] text-black shadow-[0_0_15px_rgba(233,185,73,0.35)]'
                    : 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories & news..."
            className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-xs text-white placeholder-neutral-500 backdrop-blur-md outline-none transition focus:border-[#e9b949]/60 focus:bg-white/[0.07]"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="my-16 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-lg font-medium text-white mb-2">No stories found</p>
          <p className="text-sm text-neutral-400 mb-6">
            Try adjusting your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="rounded-full border border-[#e9b949] px-6 py-2 text-xs font-semibold uppercase tracking-wider text-[#e9b949] hover:bg-[#e9b949] hover:text-black transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Featured Story */}
      {featuredPost && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-[#e9b949]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#e9b949]">
              Featured Story
            </span>
          </div>
          <BlogCard post={featuredPost} featured={true} />
        </div>
      )}

      {/* Remaining Grid */}
      {remainingPosts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Latest Articles
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {remainingPosts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
