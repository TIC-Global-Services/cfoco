'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/sanity/lib/types';
import { urlForImage } from '@/sanity/lib/image';
import { getLocalized } from '@/sanity/lib/localized';
import PortableText from '@/components/blog/PortableText';
import BlogCard from '@/components/blog/BlogCard';
import Reveal from '@/reusable/Reveal';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PortableTextBlock, TypedObject } from '@portabletext/types';

interface BlogPostClientProps {
  post: Post;
  relatedPosts: Post[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const { t, i18n } = useTranslation('blog');

  const heroImageUrl =
    post.mainImage?.asset?.url ||
    (post.mainImage ? urlForImage(post.mainImage)?.url() : null) ||
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80';

  const postTitle = getLocalized(post.title, i18n.language);
  const postExcerpt = post.excerpt ? getLocalized(post.excerpt, i18n.language) : null;
  const rawBody = post.body ? getLocalized(post.body, i18n.language) : null;
  const bodyBlocks = Array.isArray(rawBody)
    ? (rawBody as PortableTextBlock[] | TypedObject[])
    : null;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : t('card.recent', 'Recent');

  return (
    <article className="relative z-10 w-full flex-1 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 sm:py-16 w-full">
        {/* Back Link */}
        <Reveal>
          <div className="mb-8">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-[#e9b949] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('detail.back', 'Back to Stories')}
            </Link>
          </div>
        </Reveal>

        {/* Post Header */}
        <Reveal>
          <header className="mb-10">
            {/* Category */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((cat) => (
                  <span
                    key={cat._id}
                    className="inline-flex items-center gap-1 rounded-full border border-[#e9b949]/30 bg-[#e9b949]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#e9b949]"
                  >
                    <Tag className="w-3 h-3" />
                    {getLocalized(cat.title, i18n.language)}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
              {postTitle}
            </h1>

            {/* Excerpt */}
            {postExcerpt && (
              <p className="text-lg sm:text-xl text-neutral-300 font-light leading-relaxed mb-8">
                {postExcerpt}
              </p>
            )}

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 border-y border-white/10 py-4 text-xs tracking-wider uppercase text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#e9b949]" />
                {formattedDate}
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {t('detail.readTime', '4 min read')}
              </span>
            </div>
          </header>
        </Reveal>

        {/* Hero Image */}
        <Reveal>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 mb-12 shadow-2xl">
            <Image
              src={heroImageUrl}
              alt={post.mainImage?.alt || postTitle}
              fill
              priority
              className="object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </Reveal>

        {/* Main Content Body */}
        <Reveal>
          <div className="mb-16">
            {bodyBlocks && bodyBlocks.length > 0 ? (
              <PortableText value={bodyBlocks} />
            ) : (
              <p className="text-neutral-400 italic">
                {t('detail.noContent', 'No content written yet for this post.')}
              </p>
            )}
          </div>
        </Reveal>

        {/* More Stories */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-white/10 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {t('detail.moreStories', 'More Stories')}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {t(
                    'detail.moreStoriesSubtitle',
                    'Continue exploring our latest journal entries'
                  )}
                </p>
              </div>
              <Link
                href="/blogs"
                className="text-xs font-semibold uppercase tracking-wider text-[#e9b949] hover:underline"
              >
                {t('detail.viewAll', 'View All')}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <BlogCard key={related._id} post={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
