/**
 * Threads Replies API 路由
 * GET /api/meta/threads/replies?postId=xxx - 取得貼文回覆
 * POST /api/meta/threads/replies - 回覆貼文
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createLogger } from '@/lib/logger';
import { getMetaServices, MetaApiException } from '@/lib/services';

const logger = createLogger('threads/replies');
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const reverse = searchParams.get('reverse') === 'true';
    const after = searchParams.get('after') || undefined;

    if (!postId) {
      return NextResponse.json({ error: '缺少 postId 參數' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const replies = await threads.getReplies(postId, accessToken, { reverse, after });

    return NextResponse.json(replies);
  } catch (error) {
    logger.error('Failed to fetch Threads replies', error);

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
    const { threadsUserId, replyToId, text } = body;

    if (!threadsUserId || !replyToId || !text) {
      return NextResponse.json({ error: '缺少 threadsUserId、replyToId 或 text' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const result = await threads.replyToPost(threadsUserId, accessToken, replyToId, text);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    logger.error('Failed to reply to Threads post', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}
