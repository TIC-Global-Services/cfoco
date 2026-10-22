import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/sanity/lib/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cfoco.com';

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/our-story`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/location`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/career`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. Dynamic Blog Pages from Sanity CMS (with graceful fallback)
  try {
    const { posts } = await getAllPosts();
    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blogs/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return staticRoutes;
  }
}
