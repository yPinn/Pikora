/**
 * Auth.js v5 配置 (Edge Runtime 相容)
 * 此檔案不包含 Prisma adapter，可在 middleware 中使用
 */

import Facebook from 'next-auth/providers/facebook';

import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [
    Facebook({
      clientId: process.env.META_APP_ID!,
      clientSecret: process.env.META_APP_SECRET!,
      authorization: {
        params: {
          // 請求的權限範圍
          scope: [
            'public_profile',
            'email',
            'pages_show_list',
            'pages_read_engagement',
            'pages_read_user_content',
            'pages_manage_posts',
            'pages_manage_engagement',
            'pages_manage_metadata',
          ].join(' '),
        },
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // 定義需要保護的路由
      const protectedPaths = ['/facebook', '/instagram', '/threads'];
      const isProtectedRoute = protectedPaths.some((path) => nextUrl.pathname.startsWith(path));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        // 重定向到登入頁
        return false;
      }

      return true;
    },
    async jwt({ token, account }) {
      // 首次登入時，將 access_token 存入 JWT
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // 將 token 資訊傳遞到 session
      if (token) {
        session.accessToken = token.accessToken as string;
        session.provider = token.provider as string;
        session.providerAccountId = token.providerAccountId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

// 擴展 Session 和 JWT 類型
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    provider?: string;
    providerAccountId?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    providerAccountId?: string;
  }
}
