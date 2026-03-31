/**
 * Auth.js v5 完整配置
 * 包含 Prisma adapter，用於 API 路由和 Server Components
 */

import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

import prisma from '@/lib/prisma';

import { authConfig } from './config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  basePath: '/api/auth',
  // 加上這個可以確保獨立性
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token.pikora'
          : 'next-auth.session-token.pikora',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: process.env.NODE_ENV === 'production' ? '/pikora' : '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
