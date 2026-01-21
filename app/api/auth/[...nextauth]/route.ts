/**
 * NextAuth.js API 路由
 * 處理 /api/auth/* 的所有請求
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
