/**
 * Facebook User Picture Proxy
 * GET /api/facebook/picture?userId={id}&pageId={pageId}
 * 以 page access token 取得 PSID 用戶頭像（PSID 須搭配 page token）
 * pageId 為選填：無時嘗試用 user access token（適用於 ASID）
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getRequestAccessToken } from '@/lib/auth/get-server-token';
import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get('userId');
  const pageId = searchParams.get('pageId');

  if (!userId || !/^\d+$/.test(userId)) {
    return new NextResponse(null, { status: 400 });
  }

  const userAccessToken = await getRequestAccessToken(request);
  if (!userAccessToken) {
    return new NextResponse(null, { status: 401 });
  }

  let accessToken = userAccessToken;

  if (pageId && /^\d+$/.test(pageId)) {
    try {
      const { facebook } = getMetaServices();
      accessToken = await facebook.getPageAccessToken(pageId, userAccessToken);
    } catch {
      // 取不到 page token 時 fallback 用 user token
    }
  }

  const url = `https://graph.facebook.com/${userId}/picture?type=square&access_token=${accessToken}`;

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
