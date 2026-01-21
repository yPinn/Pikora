/**
 * Facebook Posts API 路由
 * GET /api/meta/facebook/posts?pageId=xxx - 取得專頁貼文列表
 * POST /api/meta/facebook/posts - 發布新貼文
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const after = searchParams.get('after') || undefined;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!pageId) {
      return NextResponse.json({ error: '缺少 pageId 參數' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const posts = await facebook.getPosts(pageId, accessToken, { limit, after });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('取得貼文列表失敗:', error);

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
    const { pageId, message, link, published, scheduledPublishTime } = body;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!pageId) {
      return NextResponse.json({ error: '缺少 pageId' }, { status: 400 });
    }

    if (!message && !link) {
      return NextResponse.json({ error: '需要提供 message 或 link' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const result = await facebook.createPost(pageId, accessToken, {
      message,
      link,
      published,
      scheduled_publish_time: scheduledPublishTime,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('發布貼文失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
