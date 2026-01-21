/**
 * Instagram Comments API 路由
 * GET /api/meta/instagram/comments?mediaId=xxx - 取得媒體留言
 * POST /api/meta/instagram/comments - 回覆留言
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const after = searchParams.get('after') || undefined;
    const fetchAll = searchParams.get('fetchAll') === 'true';

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

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
    console.error('取得 Instagram 留言列表失敗:', error);

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
    const { mediaId, commentId, message } = body;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!mediaId || !commentId || !message) {
      return NextResponse.json({ error: '缺少 mediaId、commentId 或 message' }, { status: 400 });
    }

    const { instagram } = getMetaServices();
    const result = await instagram.replyToComment(mediaId, accessToken, commentId, message);

    return NextResponse.json(result);
  } catch (error) {
    console.error('回覆 Instagram 留言失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
