import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pikora.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/facebook/', '/instagram/', '/threads/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
