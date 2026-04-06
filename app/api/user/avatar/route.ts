/**
 * User Avatar Proxy
 * GET /api/user/avatar - 以 server-side access token 從 Graph API 取得頭像並轉發
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME_SECURE,
  SESSION_COOKIE_NAME_INSECURE,
} from '@/lib/auth/cookie-names';

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error('AUTH_SECRET environment variable is required');

const COOKIE_NAME_CANDIDATES = Array.from(
  new Set([SESSION_COOKIE_NAME, SESSION_COOKIE_NAME_SECURE, SESSION_COOKIE_NAME_INSECURE])
);

export async function GET(request: NextRequest) {
  let accessToken: string | undefined;
  let providerAccountId: string | undefined;

  for (const cookieName of COOKIE_NAME_CANDIDATES) {
    const token = await getToken({ req: request, secret, cookieName });
    if (token?.accessToken && token?.providerAccountId) {
      accessToken = token.accessToken as string;
      providerAccountId = token.providerAccountId as string;
      break;
    }
  }

  if (!accessToken || !providerAccountId) {
    return new NextResponse(null, { status: 401 });
  }

  const url = `https://graph.facebook.com/${providerAccountId}/picture?type=square`;

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

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
