import React from 'react';
import type { Metadata } from 'next';
import { getAllPosts } from '@/sanity/lib/client';
import BlogListClient from '@/components/blog/BlogListClient';
import BlogHeader from '@/components/blog/BlogHeader';
import Reveal from '@/reusable/Reveal';
import JsonLd from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cfoco.com';

export const metadata: Metadata = {
  title: 'News & Blogs | CFOCO Chronicles & Culinary Stories',
  description:
    'Explore culinary chronicles, the science of the 14-spice crunch, French free-range poultry sourcing, artisanal dips, and kitchen stories from CFOCO.',
  alternates: {
    canonical: '/blogs',
  },
  openGraph: {
    title: 'News & Blogs | CFOCO Chronicles & Culinary Stories',
    description:
      'Explore culinary chronicles, the science of the 14-spice crunch, French free-range poultry sourcing, artisanal dips, and kitchen stories from CFOCO.',
    url: `${siteUrl}/blogs`,
    type: 'website',
    images: [
      {
        url: '/fried-chickens.png',
        width: 1200,
        height: 630,
        alt: 'CFOCO Gourmet Crispy Fried Chicken Fillets and Stories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News & Blogs | CFOCO Chronicles & Culinary Stories',
    description:
      'Culinary stories, kitchen secrets, and the art of French crispy fried chicken.',
    images: ['/fried-chickens.png'],
  },
};

// Fresh content on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewsBlogsPage() {
  const { posts, isLive } = await getAllPosts();

  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CFOCO Chronicles & Journal',
    description:
      'Stories from the heart of CFOCO: French street food culture, kitchen craftsmanship, recipes, and origin stories.',
    url: `${siteUrl}/blogs`,
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
    ],
  };

  return (
    <div className="relative z-10 w-full flex-1 flex flex-col">
      <JsonLd data={[blogListJsonLd, breadcrumbJsonLd]} />
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
