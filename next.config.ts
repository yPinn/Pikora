import type { NextConfig } from 'next';

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
};

module.exports = nextConfig;
