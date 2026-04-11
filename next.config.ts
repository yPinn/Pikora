import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // unsafe-eval 僅在開發模式需要 (HMR)，production 不包含
      `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.fbcdn.net https://platform-lookaside.fbsbx.com https://lookaside.fbsbx.com https://graph.facebook.com",
      "font-src 'self'",
      "connect-src 'self' https://graph.facebook.com https://graph.threads.net",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Facebook CDN (用戶大頭貼、貼文圖片) - 單層萬用字元，不允許任意子網域深度
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      { protocol: 'https', hostname: 'lookaside.fbsbx.com' },
      // Facebook Graph API 大頭貼
      { protocol: 'https', hostname: 'graph.facebook.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
