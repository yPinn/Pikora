/**
 * Threads Replies API 路由
 * GET /api/meta/threads/replies?postId=xxx - 取得貼文回覆
 * POST /api/meta/threads/replies - 回覆貼文
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const reverse = searchParams.get('reverse') === 'true';
    const after = searchParams.get('after') || undefined;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: '缺少 postId 參數' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const replies = await threads.getReplies(postId, accessToken, { reverse, after });

    return NextResponse.json(replies);
  } catch (error) {
    console.error('取得 Threads 回覆列表失敗:', error);

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
    const { threadsUserId, replyToId, text } = body;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!threadsUserId || !replyToId || !text) {
      return NextResponse.json({ error: '缺少 threadsUserId、replyToId 或 text' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const result = await threads.replyToPost(threadsUserId, accessToken, replyToId, text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('回覆 Threads 貼文失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
