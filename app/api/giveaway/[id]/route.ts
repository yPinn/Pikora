import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    console.error('取得抽獎活動失敗:', error);
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

    // 驗證權限
    const existing = await prisma.giveaway.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    // 儲存中獎者
    if (body.winners) {
      await prisma.$transaction(async (tx) => {
        for (const w of body.winners) {
          await tx.winner.create({
            data: {
              giveawayId: id,
              prizeId: w.prize_id,
              from_id: w.from_id,
              from_name: w.from_name,
              from_picture_url: w.from_picture_url,
              comment_id: w.comment_id,
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
      where: { id },
      include: {
        prizes: { orderBy: { sort_order: 'asc' } },
        winners: { orderBy: { drawnAt: 'asc' } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('更新抽獎活動失敗:', error);
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
    console.error('刪除抽獎活動失敗:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
