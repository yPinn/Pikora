/**
 * Threads Posts API 路由
 * GET /api/meta/threads/posts?threadsUserId=xxx - 取得貼文列表
 * POST /api/meta/threads/posts - 發布貼文
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const threadsUserId = searchParams.get('threadsUserId');
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const after = searchParams.get('after') || undefined;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!threadsUserId) {
      return NextResponse.json({ error: '缺少 threadsUserId 參數' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const posts = await threads.getPosts(threadsUserId, accessToken, { limit, after });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('取得 Threads 貼文列表失敗:', error);

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
    const { threadsUserId, mediaType, text, imageUrl, videoUrl, replyToId, replyControl } = body;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

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
    console.error('發布 Threads 貼文失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
