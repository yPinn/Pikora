/**
 * Facebook Comments API 路由
 * GET /api/facebook/comments?postId=xxx&pageId=xxx - 取得貼文留言
 * POST /api/facebook/comments - 回覆留言
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
    const postId = searchParams.get('postId');
    const pageId = searchParams.get('pageId');
    const rawLimit = parseInt(searchParams.get('limit') || '100', 10);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 100 : rawLimit), 200);
    const after = searchParams.get('after') || undefined;
    const fetchAll = searchParams.get('fetchAll') === 'true';

    if (!postId) {
      return NextResponse.json({ error: '缺少 postId 參數' }, { status: 400 });
    }

    if (!pageId) {
      return NextResponse.json({ error: '缺少 pageId 參數' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const pageAccessToken = await facebook.getPageAccessToken(pageId, session.accessToken);

    if (fetchAll) {
      const comments = await facebook.getAllComments(postId, pageAccessToken);
      return NextResponse.json({ data: comments, total: comments.length });
    }

    const comments = await facebook.getComments(postId, pageAccessToken, { limit, after });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('取得留言列表失敗:', error);
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
    const { commentId, message, pageId } = body;

    if (!commentId || !message || !pageId) {
      return NextResponse.json({ error: '缺少 commentId、message 或 pageId' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const pageAccessToken = await facebook.getPageAccessToken(pageId, session.accessToken);
    const result = await facebook.replyToComment(commentId, pageAccessToken, message);

    return NextResponse.json(result);
  } catch (error) {
    console.error('回覆留言失敗:', error);
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}
