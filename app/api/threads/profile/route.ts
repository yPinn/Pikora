/**
 * Threads Profile API 路由
 * GET /api/meta/threads/profile?threadsUserId=xxx - 取得帳號資訊
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const threadsUserId = searchParams.get('threadsUserId');

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    if (!threadsUserId) {
      return NextResponse.json({ error: '缺少 threadsUserId 參數' }, { status: 400 });
    }

    const { threads } = getMetaServices();
    const profile = await threads.getProfile(threadsUserId, accessToken);

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('取得 Threads 帳號資訊失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
