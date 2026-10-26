'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Post } from '@/sanity/lib/types';
import BlogCard from './BlogCard';
import { Search, ChevronDown, Check, X, SlidersHorizontal } from 'lucide-react';

interface BlogListClientProps {
  initialPosts: Post[];
  isLive: boolean;
}

export default function BlogListClient({ initialPosts, isLive: _isLive }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute category post counts and unique category list
  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set('All', initialPosts.length);

    initialPosts.forEach((post) => {
      post.categories?.forEach((cat: { title?: string | null }) => {
        if (cat.title) {
          counts.set(cat.title, (counts.get(cat.title) || 0) + 1);
        }
      });
    });

    const categoryList = ['All', ...Array.from(counts.keys()).filter((c) => c !== 'All')];
    return { categoryList, counts };
  }, [initialPosts]);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        post.title?.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q) ||
        post.author?.name?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' ||
        post.categories?.some((c: { title?: string | null }) => c?.title?.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [initialPosts, searchQuery, selectedCategory]);

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="w-full">
      {/* Controls Bar: Category Dropdown & Search */}
      <div className="mb-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            className={`group inline-flex items-center justify-between gap-3 min-w-[240px] px-4 py-2.5 rounded-full border text-xs font-medium tracking-wider uppercase transition-all duration-300 ${
              selectedCategory !== 'All'
                ? 'border-[#e9b949] bg-[#e9b949]/10 text-white shadow-[0_0_20px_rgba(233,185,73,0.18)]'
                : 'border-white/10 bg-white/[0.04] text-neutral-200 hover:border-white/25 hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <SlidersHorizontal
                className={`w-3.5 h-3.5 transition-colors ${
                  selectedCategory !== 'All'
                    ? 'text-[#e9b949]'
                    : 'text-neutral-400 group-hover:text-white'
                }`}
              />
              <span className="text-neutral-400 font-normal">Category:</span>
              <span className="font-semibold text-white truncate">
                {selectedCategory === 'All' ? 'All Stories' : selectedCategory}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-neutral-300 font-mono">
                {categoryStats.counts.get(selectedCategory) ?? filteredPosts.length}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180 text-[#e9b949]' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown Menu Panel */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-white/15 bg-[#121520]/95 backdrop-blur-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  Select Category
                </span>
                <span className="text-[10px] text-[#e9b949] font-mono">
                  {categoryStats.categoryList.length} options
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
                {categoryStats.categoryList.map((category) => {
                  const isSelected = selectedCategory === category;
                  const count = categoryStats.counts.get(category) || 0;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors duration-150 ${
                        isSelected
                          ? 'bg-[#e9b949]/15 text-[#e9b949] font-semibold'
                          : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-[#e9b949]' : 'bg-white/20'
                          }`}
                        />
                        <span className="truncate">
                          {category === 'All' ? 'All Categories' : category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-neutral-400">
                          {count}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#e9b949]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCategory !== 'All' && (
                <div className="border-t border-white/10 pt-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-center py-1.5 text-[11px] text-neutral-400 hover:text-white transition"
                  >
                    Reset to All Categories
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories & news..."
            className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-9 text-xs text-white placeholder-neutral-500 backdrop-blur-md outline-none transition focus:border-[#e9b949]/60 focus:bg-white/[0.07]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-400">Active filters:</span>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e9b949]/30 bg-[#e9b949]/10 px-3 py-1 text-xs text-[#e9b949]">
              <span>Category: {selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="hover:text-white"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery.trim() !== '' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-neutral-200">
              <span>Query: "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:text-white"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#e9b949] hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="my-16 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-lg font-medium text-white mb-2">No stories found</p>
          <p className="text-sm text-neutral-400 mb-6">
            Try adjusting your search query or switching categories.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-[#e9b949] px-6 py-2 text-xs font-semibold uppercase tracking-wider text-[#e9b949] hover:bg-[#e9b949] hover:text-black transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Uniform 3-Column Card Grid for all posts */
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#e9b949]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
              {selectedCategory === 'All'
                ? `Latest Articles (${filteredPosts.length})`
                : `${selectedCategory} (${filteredPosts.length})`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post._id} post={post} featured={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
