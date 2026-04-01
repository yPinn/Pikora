/**
 * Server-side token helpers
 * 讓 API routes 與 Server Components 直接讀取 JWT 中的 accessToken，
 * 避免將 accessToken 暴露於 session callback（即 /api/auth/session 端點）。
 */

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { getToken } from 'next-auth/jwt';

import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME_SECURE,
  SESSION_COOKIE_NAME_INSECURE,
} from './cookie-names';

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error('AUTH_SECRET environment variable is required');

// 依序嘗試兩個 cookie 名稱，與 proxy 的雙讀邏輯一致，
// 防止 NEXT_PUBLIC_DEPLOYMENT_ENV 設定偏移造成 server component 讀不到 token。
const COOKIE_NAME_CANDIDATES = Array.from(
  new Set([SESSION_COOKIE_NAME, SESSION_COOKIE_NAME_SECURE, SESSION_COOKIE_NAME_INSECURE])
);

/**
 * API routes 用：從 NextRequest 讀取 JWT 並回傳 accessToken。
 * 回傳 null 表示未登入或 token 已過期。
 */
export async function getRequestAccessToken(req: NextRequest): Promise<string | null> {
  for (const cookieName of COOKIE_NAME_CANDIDATES) {
    const token = await getToken({ req, secret, cookieName });
    if (token?.accessToken) return token.accessToken as string;
  }
  return null;
}

/**
 * Server Components 用（無 NextRequest）：從 cookies() 讀取 JWT。
 * 回傳 null 表示未登入或 token 已過期。
 */
export async function getComponentAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  // getToken 從 req.headers.get("cookie") 解析 cookie，不讀 req.cookies
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('; ');
  const headers = new Headers({ cookie: cookieHeader });
  for (const cookieName of COOKIE_NAME_CANDIDATES) {
    const token = await getToken({
      req: { headers } as unknown as NextRequest,
      secret,
      cookieName,
    });
    if (token?.accessToken) return token.accessToken as string;
  }
  return null;
}
