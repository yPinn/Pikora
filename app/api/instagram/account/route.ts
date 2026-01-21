/**
 * Instagram Account API 路由
 * GET /api/meta/instagram/account?igUserId=xxx - 取得帳號資訊
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const igUserId = searchParams.get('igUserId');

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!igUserId) {
      return NextResponse.json({ error: '缺少 igUserId 參數' }, { status: 400 });
    }

    const { instagram } = getMetaServices();
    const account = await instagram.getAccount(igUserId, accessToken);

    return NextResponse.json({ data: account });
  } catch (error) {
    console.error('取得 Instagram 帳號資訊失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
