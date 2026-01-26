import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/giveaway/blacklist - 取得黑名單
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json({ error: '缺少 pageId' }, { status: 400 });
    }

    const blacklist = await prisma.giveawayBlacklist.findMany({
      where: { userId: session.user.id, pageId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: blacklist });
  } catch (error) {
    console.error('取得黑名單失敗:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

// POST /api/giveaway/blacklist - 新增黑名單
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, from_id, from_name, reason } = body;

    if (!pageId || !from_id) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const entry = await prisma.giveawayBlacklist.upsert({
      where: {
        userId_pageId_from_id: {
          userId: session.user.id,
          pageId,
          from_id,
        },
      },
      update: { from_name, reason },
      create: {
        userId: session.user.id,
        pageId,
        from_id,
        from_name,
        reason,
      },
    });

    return NextResponse.json({ data: entry });
  } catch (error) {
    console.error('新增黑名單失敗:', error);
    return NextResponse.json({ error: '新增失敗' }, { status: 500 });
  }
}

// DELETE /api/giveaway/blacklist - 移除黑名單
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const fromId = searchParams.get('fromId');

    if (!pageId || !fromId) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    await prisma.giveawayBlacklist.delete({
      where: {
        userId_pageId_from_id: {
          userId: session.user.id,
          pageId,
          from_id: fromId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('移除黑名單失敗:', error);
    return NextResponse.json({ error: '移除失敗' }, { status: 500 });
  }
}
