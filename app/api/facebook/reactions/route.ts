/**
 * Facebook Reactions API 路由
 * GET /api/facebook/reactions?postId=xxx&pageId=xxx - 取得貼文反應者列表
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getMetaServices } from '@/lib/services';
import type { ReactionType } from '@/lib/services/facebook';

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
    const type = searchParams.get('type') as ReactionType | undefined;

    if (!postId) {
      return NextResponse.json({ error: '缺少 postId 參數' }, { status: 400 });
    }

    if (!pageId) {
      return NextResponse.json({ error: '缺少 pageId 參數' }, { status: 400 });
    }

    const { facebook } = getMetaServices();
    const pageAccessToken = await facebook.getPageAccessToken(pageId, session.accessToken);

    if (fetchAll) {
      const reactions = await facebook.getAllPostReactions(postId, pageAccessToken, { type });
      return NextResponse.json({ data: reactions, total: reactions.length });
    }

    const reactions = await facebook.getPostReactions(postId, pageAccessToken, {
      limit,
      after,
      type,
    });
    return NextResponse.json(reactions);
  } catch (error) {
    console.error('取得反應列表失敗:', error);
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}
