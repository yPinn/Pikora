/**
 * Auth.js v5 完整配置
 * 包含 Prisma adapter，用於 API 路由和 Server Components
 */

import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

import prisma from '@/lib/prisma';
import { discordNotify } from '@/lib/utils/discord-notify';

import { authConfig } from './config';
import { SESSION_COOKIE_NAME, IS_PROD, APP_BASE_PATH } from './cookie-names';

const { jwt: baseJwt, ...restCallbacks } = authConfig.callbacks ?? {};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  basePath: '/api/auth',
  events: {
    async createUser({ user }) {
      void discordNotify({
        level: 'info',
        title: '新用戶首次登入 Pikora',
        description: '請至 Meta App 後台確認是否需要將其加為測試人員。',
        fields: {
          名稱: user.name ?? '未知',
          Email: user.email ?? '未知',
        },
      });
    },
  },
  callbacks: {
    ...restCallbacks,
    async jwt(params) {
      // 執行原有 jwt callback（token 過期檢查、accessToken 儲存等）
      const token = baseJwt ? await baseJwt(params) : params.token;
      if (!token) return token;

      // 若已標記錯誤，直接回傳，不再查 DB
      if (token.error) return token;

      // 撤銷檢查：比對 tokenRevokedAt 與 JWT 簽發時間（iat）
      // 只在 token.sub 存在時才查（避免匿名/不完整 token 發出 DB 請求）
      if (token.sub && token.iat) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { tokenRevokedAt: true },
        });
        if (user?.tokenRevokedAt) {
          const revokedAtSec = user.tokenRevokedAt.getTime() / 1000;
          if (token.iat < revokedAtSec) {
            return { ...token, accessToken: undefined, error: 'TokenRevoked' as const };
          }
        }
      }

      return token;
    },
  },
  // 加上這個可以確保獨立性（隔離 cookie，避免同一來源下多個 Next.js 應用互相干擾）
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: APP_BASE_PATH || '/',
        secure: IS_PROD,
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
