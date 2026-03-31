/**
 * Instagram Media API 路由
 * GET /api/meta/instagram/media?igUserId=xxx - 取得媒體列表
 * POST /api/meta/instagram/media - 發布媒體
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getRequestAccessToken } from '@/lib/auth/get-server-token';
import { createLogger } from '@/lib/logger';
import { getMetaServices, MetaApiException } from '@/lib/services';
import { isValidPublicMediaUrl } from '@/lib/utils/facebook';

const logger = createLogger('instagram/media');
export async function GET(request: NextRequest) {
  try {
    const accessToken = await getRequestAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const igUserId = searchParams.get('igUserId');
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const after = searchParams.get('after') || undefined;

    if (!igUserId) {
      return NextResponse.json({ error: '缺少 igUserId 參數' }, { status: 400 });
    }

    const { instagram } = getMetaServices();
    const media = await instagram.getMedia(igUserId, accessToken, { limit, after });

    return NextResponse.json(media);
  } catch (error) {
    logger.error('Failed to fetch Instagram media', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getRequestAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { igUserId, mediaType, imageUrl, videoUrl, caption, shareToFeed } = body;

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
        if (!isValidPublicMediaUrl(imageUrl)) {
          return NextResponse.json({ error: '無效的 imageUrl' }, { status: 400 });
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
        if (!isValidPublicMediaUrl(videoUrl)) {
          return NextResponse.json({ error: '無效的 videoUrl' }, { status: 400 });
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

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    logger.error('Failed to publish Instagram media', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}
