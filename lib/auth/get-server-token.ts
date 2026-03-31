/**
 * Server-side token helpers
 * 讓 API routes 與 Server Components 直接讀取 JWT 中的 accessToken，
 * 避免將 accessToken 暴露於 session callback（即 /api/auth/session 端點）。
 */

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { getToken } from 'next-auth/jwt';

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error('AUTH_SECRET environment variable is required');

/**
 * API routes 用：從 NextRequest 讀取 JWT 並回傳 accessToken。
 * 回傳 null 表示未登入或 token 已過期。
 */
export async function getRequestAccessToken(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret });
  if (!token?.accessToken) return null;
  return token.accessToken as string;
}

/**
 * Server Components 用（無 NextRequest）：從 cookies() 讀取 JWT。
 * 回傳 null 表示未登入或 token 已過期。
 */
export async function getComponentAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  // getToken 接受 { headers, cookies } 形式的 request-like 物件
  const token = await getToken({
    req: { headers: new Headers(), cookies: cookieStore } as unknown as NextRequest,
    secret,
  });
  if (!token?.accessToken) return null;
  return token.accessToken as string;
}
