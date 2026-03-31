/**
 * Instagram Account API 路由
 * GET /api/meta/instagram/account?igUserId=xxx - 取得帳號資訊
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getRequestAccessToken } from '@/lib/auth/get-server-token';
import { createLogger } from '@/lib/logger';
import { getMetaServices, MetaApiException } from '@/lib/services';

const logger = createLogger('instagram/account');
export async function GET(request: NextRequest) {
  try {
    const accessToken = await getRequestAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const igUserId = searchParams.get('igUserId');

    if (!igUserId) {
      return NextResponse.json({ error: '缺少 igUserId 參數' }, { status: 400 });
    }

    const { instagram } = getMetaServices();
    const account = await instagram.getAccount(igUserId, accessToken);

    return NextResponse.json({ data: account });
  } catch (error) {
    logger.error('Failed to fetch Instagram account', error);

    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}
