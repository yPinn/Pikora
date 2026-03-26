/**
 * Facebook Pages API 路由
 * GET /api/facebook/pages - 取得用戶管理的所有專頁
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createLogger } from '@/lib/logger';
import { getMetaServices, MetaApiException } from '@/lib/services';

const logger = createLogger('facebook/pages');
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { facebook } = getMetaServices();
    const pages = await facebook.getPages(session.accessToken);

    return NextResponse.json({ data: pages });
  } catch (error) {
    logger.error('Failed to fetch pages', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}
