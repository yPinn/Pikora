/**
 * Facebook Posts API 路由
 * GET /api/facebook/posts?pageId=xxx - 取得專頁貼文列表
 * POST /api/facebook/posts - 發布新貼文
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const postId = searchParams.get('postId');
    const rawLimit = parseInt(searchParams.get('limit') || '25', 10);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 25 : rawLimit), 100);
    const after = searchParams.get('after') || undefined;

    if (!pageId) {
      return NextResponse.json({ error: '缺少 pageId 參數' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const pageAccessToken = await facebook.getPageAccessToken(pageId, session.accessToken);

    if (postId) {
      const post = await facebook.getPost(postId, pageAccessToken);
      return NextResponse.json({ data: post });
    }

    const posts = await facebook.getPosts(pageId, pageAccessToken, { limit, after });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('取得貼文失敗:', error);
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, message, link, published, scheduledPublishTime } = body;

    if (!pageId) {
      return NextResponse.json({ error: '缺少 pageId' }, { status: 400 });
    }

    if (!message && !link) {
      return NextResponse.json({ error: '需要提供 message 或 link' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const pageAccessToken = await facebook.getPageAccessToken(pageId, session.accessToken);
    const result = await facebook.createPost(pageId, pageAccessToken, {
      message,
      link,
      published,
      scheduled_publish_time: scheduledPublishTime,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('發布貼文失敗:', error);
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}
