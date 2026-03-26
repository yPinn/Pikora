/**
 * Auth.js v5 配置 (Edge Runtime 相容)
 * 此檔案不包含 Prisma adapter，可在 middleware 中使用
 */

import Facebook from 'next-auth/providers/facebook';

import type { NextAuthConfig } from 'next-auth';

const clientId = process.env.META_APP_ID;
const clientSecret = process.env.META_APP_SECRET;
if (!clientId || !clientSecret) {
  throw new Error('META_APP_ID and META_APP_SECRET environment variables are required');
}

export const authConfig: NextAuthConfig = {
  providers: [
    Facebook({
      clientId,
      clientSecret,
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
          ].join(' '),
        },
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const hasTokenError = auth?.error === 'AccessTokenExpired';

      // 定義需要保護的路由
      const protectedPaths = ['/facebook', '/instagram', '/threads'];
      const isProtectedRoute = protectedPaths.some((path) => nextUrl.pathname.startsWith(path));

      if (isProtectedRoute) {
        // Token 過期：強制重新登入
        if (hasTokenError) return false;
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
        return token;
      }

      // Access token 已過期：清除並標記錯誤，讓 authorized callback 強制重新登入
      if (token.expiresAt && Date.now() / 1000 > (token.expiresAt as number)) {
        return { ...token, accessToken: undefined, error: 'AccessTokenExpired' as const };
      }

      return token;
    },
    async session({ session, token }) {
      // 將 token 資訊傳遞到 session
      if (token) {
        session.accessToken = token.accessToken as string | undefined;
        session.provider = token.provider as string;
        session.providerAccountId = token.providerAccountId as string;
        if (token.error) {
          session.error = token.error as string;
        }
        // 將 user.id 從 token.sub 傳遞到 session
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
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
    error?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    providerAccountId?: string;
    error?: string;
  }
}
