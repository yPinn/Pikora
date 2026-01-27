/**
 * Facebook Reactions API 路由
 * GET /api/facebook/reactions?postId=xxx - 取得貼文反應者列表
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';
import type { ReactionType } from '@/lib/services/facebook';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const after = searchParams.get('after') || undefined;
    const fetchAll = searchParams.get('fetchAll') === 'true';
    const type = searchParams.get('type') as ReactionType | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: '缺少 postId 參數' }, { status: 400 });
    }

    const { facebook } = getMetaServices();

    if (fetchAll) {
      const reactions = await facebook.getAllPostReactions(postId, accessToken, { type });
      return NextResponse.json({ data: reactions, total: reactions.length });
    }

    const reactions = await facebook.getPostReactions(postId, accessToken, { limit, after, type });
    return NextResponse.json(reactions);
  } catch (error) {
    console.error('取得反應列表失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
