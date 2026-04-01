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
      const hasTokenError = auth?.error === 'AccessTokenExpired' || auth?.error === 'TokenRevoked';

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
        // 使用 server-side proxy 取頭像，避免 CDN URL 過期問題
        if (account.provider === 'facebook') {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
          let basePath = '';
          try {
            const { pathname } = new URL(appUrl);
            basePath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
          } catch {
            basePath = '';
          }
          token.picture = `${basePath}/api/user/avatar`;
        }
        return token;
      }

      // Access token 已過期：清除並標記錯誤，讓 authorized callback 強制重新登入
      if (token.expiresAt && Date.now() / 1000 > (token.expiresAt as number)) {
        return { ...token, accessToken: undefined, error: 'AccessTokenExpired' as const };
      }

      return token;
    },
    async session({ session, token }) {
      // accessToken 刻意不加入 session，避免透過 /api/auth/session 暴露至前端。
      // API routes 請改用 getRequestAccessToken()，Server Components 用 getComponentAccessToken()。
      if (token) {
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
    maxAge: 24 * 60 * 60, // 24 小時，縮短 JWT 暴露窗口（預設 30 天過長）
  },
};

// 擴展 Session 和 JWT 類型
declare module 'next-auth' {
  interface Session {
    // accessToken 不暴露至 session（避免透過 /api/auth/session 送至前端）
    provider?: string;
    providerAccountId?: string;
    error?: string;
  }
}

// JWT 型別擴充（存於 HTTP-only cookie，不傳至前端）
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    providerAccountId?: string;
    error?: string;
    iat?: number; // JWT 簽發時間（Unix 秒），用於與 tokenRevokedAt 比對
  }
}
