/**
 * User Avatar Proxy
 * GET /api/user/avatar - 以 server-side access token 從 Graph API 取得頭像並轉發
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

import { SESSION_COOKIE_NAME } from '@/lib/auth/cookie-names';

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error('AUTH_SECRET environment variable is required');

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret, cookieName: SESSION_COOKIE_NAME });

  if (!token?.accessToken || !token?.providerAccountId) {
    return new NextResponse(null, { status: 401 });
  }

  const url = `https://graph.facebook.com/${token.providerAccountId}/picture?type=square&access_token=${token.accessToken}`;

  try {
    const res = await fetch(url, { redirect: 'follow' });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
