import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { Prisma } from '@/lib/generated/prisma/client';
import { createLogger } from '@/lib/logger';
import prisma from '@/lib/prisma';

const logger = createLogger('giveaway/blacklist');
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
    logger.error('Failed to fetch blacklist', error);
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

    if (typeof pageId !== 'string' || pageId.trim().length === 0) {
      return NextResponse.json({ error: '無效的 pageId' }, { status: 400 });
    }
    if (typeof from_id !== 'string' || from_id.trim().length === 0 || from_id.length > 100) {
      return NextResponse.json({ error: '無效的 from_id' }, { status: 400 });
    }
    if (from_name !== undefined && (typeof from_name !== 'string' || from_name.length > 200)) {
      return NextResponse.json({ error: '無效的 from_name' }, { status: 400 });
    }
    if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500)) {
      return NextResponse.json({ error: '無效的 reason' }, { status: 400 });
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

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    logger.error('Failed to add to blacklist', error);
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
    const fromId = searchParams.get('from_id');

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
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: '找不到黑名單記錄' }, { status: 404 });
    }
    logger.error('Failed to remove from blacklist', error);
    return NextResponse.json({ error: '移除失敗' }, { status: 500 });
  }
}
