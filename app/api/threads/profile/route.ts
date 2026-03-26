/**
 * Threads Profile API 路由
 * GET /api/meta/threads/profile?threadsUserId=xxx - 取得帳號資訊
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createLogger } from '@/lib/logger';
import { getMetaServices, MetaApiException } from '@/lib/services';

const logger = createLogger('threads/profile');
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const { searchParams } = new URL(request.url);
    const threadsUserId = searchParams.get('threadsUserId');

    if (!threadsUserId) {
      return NextResponse.json({ error: '缺少 threadsUserId 參數' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const profile = await threads.getProfile(threadsUserId, accessToken);

    return NextResponse.json({ data: profile });
  } catch (error) {
    logger.error('Failed to fetch Threads profile', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}
