'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/sanity/lib/types';
import { urlForImage } from '@/sanity/lib/image';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';

interface BlogCardProps {
  post: Post;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  // Resolve image URL
  const imageUrl =
    post.mainImage?.asset?.url ||
    (post.mainImage ? urlForImage(post.mainImage)?.url() : null) ||
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80';

  const authorImageUrl =
    post.author?.image?.asset?.url ||
    (post.author?.image ? urlForImage(post.author.image)?.url() : null);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  // Estimate read time
  const readTime = '4 min read';

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121520]/80 backdrop-blur-md transition-all duration-500 hover:border-[#e9b949]/40 hover:shadow-[0_0_35px_rgba(233,185,73,0.12)] ${
        featured ? 'lg:grid lg:grid-cols-12 lg:gap-8' : ''
      }`}
    >
      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden bg-neutral-900 ${
          featured ? 'lg:col-span-7 aspect-[16/10] lg:aspect-auto' : 'aspect-[16/10]'
        }`}
      >
        <Image
          src={imageUrl}
          alt={post.mainImage?.alt || post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        {post.categories && post.categories.length > 0 && (
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#e9b949] backdrop-blur-md">
              {post.categories[0].title}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-1 flex-col justify-between p-6 sm:p-8 ${
          featured ? 'lg:col-span-5 lg:py-10' : ''
        }`}
      >
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs tracking-wider uppercase text-neutral-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#e9b949]" />
              {formattedDate}
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              {readTime}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-[#ffd67a] ${
              featured ? 'text-2xl sm:text-3xl mb-4 leading-tight' : 'text-xl mb-3 line-clamp-2'
            }`}
          >
            <Link href={`/blogs/${post.slug}`} className="focus:outline-none">
              <span className="absolute inset-0 z-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              className={`text-neutral-400 font-light leading-relaxed ${
                featured ? 'text-base sm:text-lg line-clamp-3 mb-6' : 'text-sm line-clamp-2 mb-6'
              }`}
            >
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Footer: Author & Read more */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
          {post.author ? (
            <div className="flex items-center gap-3">
              {authorImageUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#e9b949]/30">
                  <Image
                    src={authorImageUrl}
                    alt={post.author.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#e9b949]">
                  {post.author.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-medium text-white">{post.author.name || 'Author'}</p>
                {post.author.role && (
                  <p className="text-[10px] text-neutral-400">{post.author.role}</p>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-[#e9b949] transition-transform duration-300 group-hover:translate-x-1">
            Read Story
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </article>
  );
}
