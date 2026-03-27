import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createLogger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { isFacebookCdnUrl } from '@/lib/utils/facebook';

const logger = createLogger('giveaway/[id]');
type RouteParams = { params: Promise<{ id: string }> };

// GET /api/giveaway/[id] - 取得單一活動
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id } = await params;

    const giveaway = await prisma.giveaway.findFirst({
      where: { id, userId: session.user.id },
      include: {
        prizes: { orderBy: { sort_order: 'asc' } },
        winners: { orderBy: { drawnAt: 'asc' } },
      },
    });

    if (!giveaway) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    return NextResponse.json({ data: giveaway });
  } catch (error) {
    logger.error('Failed to fetch giveaway', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

// PATCH /api/giveaway/[id] - 更新活動 (儲存中獎者)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 驗證權限，同時取得 prizes 以驗證 prizeId 所有權
    const existing = await prisma.giveaway.findFirst({
      where: { id, userId: session.user.id },
      include: { prizes: { select: { id: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    // 儲存中獎者
    if (body.winners) {
      // 驗證 winners 陣列
      if (!Array.isArray(body.winners)) {
        return NextResponse.json({ error: 'winners 格式錯誤' }, { status: 400 });
      }
      if (body.winners.length > 200) {
        return NextResponse.json({ error: 'winners 數量超過上限 (200)' }, { status: 400 });
      }

      const validPrizeIds = new Set(existing.prizes.map((p) => p.id));

      for (const w of body.winners) {
        if (typeof w.prize_id !== 'string' || !validPrizeIds.has(w.prize_id)) {
          return NextResponse.json({ error: '無效的 prize_id' }, { status: 400 });
        }
        if (
          typeof w.from_id !== 'string' ||
          w.from_id.trim().length === 0 ||
          w.from_id.length > 100
        ) {
          return NextResponse.json({ error: '無效的 from_id' }, { status: 400 });
        }
        if (
          typeof w.from_name !== 'string' ||
          w.from_name.trim().length === 0 ||
          w.from_name.length > 200
        ) {
          return NextResponse.json({ error: '無效的 from_name' }, { status: 400 });
        }
        if (
          typeof w.comment_id !== 'string' ||
          w.comment_id.trim().length === 0 ||
          w.comment_id.length > 100
        ) {
          return NextResponse.json({ error: '無效的 comment_id' }, { status: 400 });
        }
        if (typeof w.comment_message !== 'string' || w.comment_message.length > 10000) {
          return NextResponse.json({ error: '無效的 comment_message' }, { status: 400 });
        }
        const parsedTime = new Date(w.comment_created_time);
        if (isNaN(parsedTime.getTime())) {
          return NextResponse.json({ error: '無效的 comment_created_time' }, { status: 400 });
        }
      }

      await prisma.$transaction(async (tx) => {
        for (const w of body.winners) {
          await tx.winner.create({
            data: {
              giveawayId: id,
              prizeId: w.prize_id,
              from_id: w.from_id.trim(),
              from_name: w.from_name.trim(),
              from_picture_url: isFacebookCdnUrl(w.from_picture_url)
                ? w.from_picture_url
                : undefined,
              comment_id: w.comment_id.trim(),
              comment_message: w.comment_message,
              comment_created_time: new Date(w.comment_created_time),
            },
          });
        }

        // 更新狀態為已完成
        await tx.giveaway.update({
          where: { id },
          data: { status: 'COMPLETED' },
        });
      });
    }

    const updated = await prisma.giveaway.findFirst({
      where: { id, userId: session.user.id },
      include: {
        prizes: { orderBy: { sort_order: 'asc' } },
        winners: { orderBy: { drawnAt: 'asc' } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    logger.error('Failed to update giveaway', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

// DELETE /api/giveaway/[id] - 刪除活動
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.giveaway.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    await prisma.giveaway.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete giveaway', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
