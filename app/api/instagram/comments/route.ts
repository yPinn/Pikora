/**
 * Instagram Comments API 路由
 * GET /api/meta/instagram/comments?mediaId=xxx - 取得媒體留言
 * POST /api/meta/instagram/comments - 回覆留言
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createLogger } from '@/lib/logger';
import { getMetaServices, MetaApiException } from '@/lib/services';

const logger = createLogger('instagram/comments');
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const after = searchParams.get('after') || undefined;
    const fetchAll = searchParams.get('fetchAll') === 'true';

    if (!mediaId) {
      return NextResponse.json({ error: '缺少 mediaId 參數' }, { status: 400 });
    }

    const { instagram } = getMetaServices();

    if (fetchAll) {
      const comments = await instagram.getAllComments(mediaId, accessToken);
      return NextResponse.json({ data: comments, total: comments.length });
    }

    const comments = await instagram.getComments(mediaId, accessToken, { limit, after });
    return NextResponse.json(comments);
  } catch (error) {
    logger.error('Failed to fetch Instagram comments', error);

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
    const { mediaId, commentId, message } = body;

    if (!mediaId || !commentId || !message) {
      return NextResponse.json({ error: '缺少 mediaId、commentId 或 message' }, { status: 400 });
    }

    const { instagram } = getMetaServices();
    const result = await instagram.replyToComment(mediaId, accessToken, commentId, message);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to reply to Instagram comment', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}
