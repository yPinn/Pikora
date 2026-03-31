/**
 * Auth.js v5 完整配置
 * 包含 Prisma adapter，用於 API 路由和 Server Components
 */

import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

import prisma from '@/lib/prisma';

import { authConfig } from './config';
import { SESSION_COOKIE_NAME } from './cookie-names';

const isProd = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV === 'production';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  basePath: '/api/auth',
  // 加上這個可以確保獨立性（隔離 cookie，避免同一來源下多個 Next.js 應用互相干擾）
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: isProd ? '/pikora' : '/',
        secure: isProd,
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
