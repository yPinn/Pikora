/**
 * Threads Posts API 路由
 * GET /api/meta/threads/posts?threadsUserId=xxx - 取得貼文列表
 * POST /api/meta/threads/posts - 發布貼文
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createLogger } from '@/lib/logger';
import { getMetaServices, MetaApiException } from '@/lib/services';
import { isValidPublicMediaUrl } from '@/lib/utils/facebook';

const logger = createLogger('threads/posts');
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const { searchParams } = new URL(request.url);
    const threadsUserId = searchParams.get('threadsUserId');
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const after = searchParams.get('after') || undefined;

    if (!threadsUserId) {
      return NextResponse.json({ error: '缺少 threadsUserId 參數' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const posts = await threads.getPosts(threadsUserId, accessToken, { limit, after });

    return NextResponse.json(posts);
  } catch (error) {
    logger.error('Failed to fetch Threads posts', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const body = await request.json();
    const { threadsUserId, mediaType, text, imageUrl, videoUrl, replyToId, replyControl } = body;

    if (!threadsUserId) {
      return NextResponse.json({ error: '缺少 threadsUserId' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    let result: { id: string };

    switch (mediaType || 'TEXT') {
      case 'TEXT':
        if (!text) {
          return NextResponse.json({ error: '缺少 text' }, { status: 400 });
        }
        result = await threads.publishTextPost(threadsUserId, accessToken, {
          text,
          reply_to_id: replyToId,
          reply_control: replyControl,
        });
        break;

      case 'IMAGE':
        if (!imageUrl) {
          return NextResponse.json({ error: '缺少 imageUrl' }, { status: 400 });
        }
        if (!isValidPublicMediaUrl(imageUrl)) {
          return NextResponse.json({ error: '無效的 imageUrl' }, { status: 400 });
        }
        result = await threads.publishImagePost(threadsUserId, accessToken, {
          image_url: imageUrl,
          text,
          reply_to_id: replyToId,
          reply_control: replyControl,
        });
        break;

      case 'VIDEO':
        if (!videoUrl) {
          return NextResponse.json({ error: '缺少 videoUrl' }, { status: 400 });
        }
        if (!isValidPublicMediaUrl(videoUrl)) {
          return NextResponse.json({ error: '無效的 videoUrl' }, { status: 400 });
        }
        result = await threads.publishVideoPost(threadsUserId, accessToken, {
          video_url: videoUrl,
          text,
          reply_to_id: replyToId,
          reply_control: replyControl,
        });
        break;

      default:
        return NextResponse.json({ error: '不支援的 mediaType' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to publish Threads post', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}
