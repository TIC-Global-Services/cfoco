import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cfoco.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/studio/*', '/hidden-3d', '/hidden-3d/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
