/**
 * Facebook Pages API 路由
 * GET /api/meta/facebook/pages - 取得用戶管理的所有專頁
 */

import { type NextRequest, NextResponse } from 'next/server';

import { getMetaServices } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({ error: '缺少 Access Token' }, { status: 401 });
    }

    const { facebook } = getMetaServices();
    const pages = await facebook.getPages(accessToken);

    return NextResponse.json({ data: pages });
  } catch (error) {
    console.error('取得專頁列表失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
