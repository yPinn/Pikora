/**
 * Auth Middleware (樂觀檢查)
 * 1. 邊境攔截：僅檢查 Cookie 是否存在，不涉及資料庫查詢。
 * 2. 深度驗證：細節驗證由內層 Layout 的 auth() 負責。
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 獲取 Session Cookie (相容 HTTP/HTTPS)
  const sessionCookie =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token');

  const protectedPaths = ['/facebook', '/instagram', '/threads'];
  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path));

  // 未登入攔截：訪問保護頁面時強制跳轉登入
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登入跳轉：避免已登入使用者重複訪問登入頁
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/facebook/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 排除靜態檔案與 API，僅針對路由頁面進行檢查
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
