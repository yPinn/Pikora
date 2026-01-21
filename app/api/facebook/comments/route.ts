/**
 * Facebook Comments API 路由
 * GET /api/meta/facebook/comments?postId=xxx - 取得貼文留言
 * POST /api/meta/facebook/comments - 回覆留言
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const after = searchParams.get('after') || undefined;
    const fetchAll = searchParams.get('fetchAll') === 'true';

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: '缺少 postId 參數' }, { status: 400 });
    }

    const { facebook } = getMetaServices();

    if (fetchAll) {
      const comments = await facebook.getAllComments(postId, accessToken);
      return NextResponse.json({ data: comments, total: comments.length });
    }

    const comments = await facebook.getComments(postId, accessToken, { limit, after });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('取得留言列表失敗:', error);

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
    const { commentId, message } = body;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!commentId || !message) {
      return NextResponse.json({ error: '缺少 commentId 或 message' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const result = await facebook.replyToComment(commentId, accessToken, message);

    return NextResponse.json(result);
  } catch (error) {
    console.error('回覆留言失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
