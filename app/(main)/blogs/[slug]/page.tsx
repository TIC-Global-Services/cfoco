import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import PortableText from '@/components/blog/PortableText';
import BlogCard from '@/components/blog/BlogCard';
import Reveal from '@/reusable/Reveal';
import { ArrowLeft, Calendar, Clock, Share2, Tag, User } from 'lucide-react';

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

  const imageUrl =
    post.mainImage?.asset?.url ||
    (post.mainImage ? urlForImage(post.mainImage)?.url() : null) ||
    '/interior_bg.png';

  return {
    title: `${post.title} | CFOCO Journal`,
    description: post.excerpt || 'Read this story on CFOCO Journal.',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Read this story on CFOCO Journal.',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.mainImage?.alt || post.title,
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

  const heroImageUrl =
    post.mainImage?.asset?.url ||
    (post.mainImage ? urlForImage(post.mainImage)?.url() : null) ||
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80';

  const authorImageUrl =
    post.author?.image?.asset?.url ||
    (post.author?.image ? urlForImage(post.author.image)?.url() : null);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

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
              Back to Stories
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
                    {cat.title}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg sm:text-xl text-neutral-300 font-light leading-relaxed mb-8">
                {post.excerpt}
              </p>
            )}

            {/* Author & Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-4">
              <div className="flex items-center gap-3">
                {authorImageUrl ? (
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#e9b949]/40">
                    <Image
                      src={authorImageUrl}
                      alt={post.author?.name || 'Author'}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-[#e9b949] border border-white/10">
                    {post.author?.name?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {post.author?.name || 'CFOCO Editorial'}
                  </p>
                  {post.author?.role && (
                    <p className="text-xs text-neutral-400">{post.author.role}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs tracking-wider uppercase text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#e9b949]" />
                  {formattedDate}
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  4 min read
                </span>
              </div>
            </div>
          </header>
        </Reveal>

        {/* Hero Image */}
        <Reveal>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 mb-12 shadow-2xl">
            <Image
              src={heroImageUrl}
              alt={post.mainImage?.alt || post.title}
              fill
              priority
              // sizes="(max-width: 1024px) 100vw, 900px"
              className="object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </Reveal>

        {/* Main Content Body */}
        <Reveal>
          <div className="mb-16">
            {post.body ? (
              <PortableText value={post.body} />
            ) : (
              <p className="text-neutral-400 italic">No content written yet for this post.</p>
            )}
          </div>
        </Reveal>

        {/* Author Bio Box */}
        {post.author && post.author.bio && (
          <Reveal>
            <div className="mb-16 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {authorImageUrl && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#e9b949]/40 shrink-0">
                    <Image
                      src={authorImageUrl}
                      alt={post.author.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-wider text-[#e9b949] font-medium">
                      About the Author
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-white">{post.author.name}</h4>
                  {post.author.role && (
                    <p className="text-xs text-neutral-400 mb-2">{post.author.role}</p>
                  )}
                  <p className="text-sm text-neutral-300 font-light leading-relaxed">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* More Stories */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-white/10 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  More Stories
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Continue exploring our latest journal entries</p>
              </div>
              <Link
                href="/blogs"
                className="text-xs font-semibold uppercase tracking-wider text-[#e9b949] hover:underline"
              >
                View All
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
