/**
 * Facebook Pages API 路由
 * GET /api/facebook/pages - 取得用戶管理的所有專頁
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getMetaServices } from '@/lib/services';

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
    console.error('取得專頁列表失敗:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: '未知錯誤' }, { status: 500 });
  }
}
