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
  basePath: '/pikora/api/auth',
  debug: process.env.NODE_ENV === 'development',
});
