/**
 * Auth Middleware (樂觀檢查)
 * 1. 邊境攔截：僅檢查 Cookie 是否存在，不涉及資料庫查詢。
 * 2. 深度驗證：細節驗證由內層 Layout 的 auth() 負責。
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE_NAME_SECURE, SESSION_COOKIE_NAME_INSECURE } from './lib/auth/cookie-names';

// API 路由中公開可存取的路徑（不需要登入）
const PUBLIC_API_PATHS = [
  '/api/auth', // NextAuth OAuth callback
  '/api/webhook', // Meta webhook
  '/api/facebook/data-deletion', // Meta data deletion callback
  '/api/facebook/deauthorize', // Meta deauthorize callback (server-to-server, no session)
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 同時接受兩種 cookie 名稱，防止 NEXT_PUBLIC_DEPLOYMENT_ENV 漏設時鎖用戶
  const sessionCookie =
    request.cookies.get(SESSION_COOKIE_NAME_SECURE) ??
    request.cookies.get(SESSION_COOKIE_NAME_INSECURE);

  // API 路由：非公開路徑需有 session cookie（防禦第二層）
  if (pathname.startsWith('/api/')) {
    const isPublicApi = PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));
    if (!isPublicApi && !sessionCookie) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }
    return NextResponse.next();
  }

  const protectedPaths = ['/facebook', '/instagram', '/threads'];
  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path));

  // 未登入攔截：訪問保護頁面時強制跳轉登入
  // 使用 basePath 確保重定向 URL 正確
  if (isProtectedRoute && !sessionCookie) {
    const basePath = request.nextUrl.basePath;
    const loginUrl = new URL(`${basePath}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', `${basePath}${pathname}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // 排除靜態資源，涵蓋頁面路由與 API 路由
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
