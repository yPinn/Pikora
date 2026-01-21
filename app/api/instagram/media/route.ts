/**
 * Instagram Media API 路由
 * GET /api/meta/instagram/media?igUserId=xxx - 取得媒體列表
 * POST /api/meta/instagram/media - 發布媒體
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const igUserId = searchParams.get('igUserId');
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const after = searchParams.get('after') || undefined;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!igUserId) {
      return NextResponse.json({ error: '缺少 igUserId 參數' }, { status: 400 });
    }

    const { instagram } = getMetaServices();
    const media = await instagram.getMedia(igUserId, accessToken, { limit, after });

    return NextResponse.json(media);
  } catch (error) {
    console.error('取得 Instagram 媒體列表失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const body = await request.json();
    const { igUserId, mediaType, imageUrl, videoUrl, caption, shareToFeed } = body;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!igUserId) {
      return NextResponse.json({ error: '缺少 igUserId' }, { status: 400 });
    }

    const { instagram } = getMetaServices();
    let result: { id: string };

    switch (mediaType) {
      case 'IMAGE':
        if (!imageUrl) {
          return NextResponse.json({ error: '缺少 imageUrl' }, { status: 400 });
        }
        result = await instagram.publishImage(igUserId, accessToken, {
          image_url: imageUrl,
          caption,
        });
        break;

      case 'REELS':
        if (!videoUrl) {
          return NextResponse.json({ error: '缺少 videoUrl' }, { status: 400 });
        }
        result = await instagram.publishReels(igUserId, accessToken, {
          video_url: videoUrl,
          caption,
          share_to_feed: shareToFeed ?? true,
        });
        break;

      default:
        return NextResponse.json({ error: '不支援的 mediaType' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('發布 Instagram 媒體失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
