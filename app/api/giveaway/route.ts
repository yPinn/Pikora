import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { validateGiveawayFilters } from '@/lib/giveaway/types';
import prisma from '@/lib/prisma';

// GET /api/giveaway - 取得抽獎活動列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    const giveaways = await prisma.giveaway.findMany({
      where: {
        userId: session.user.id,
        ...(pageId && { pageId }),
      },
      include: {
        prizes: { orderBy: { sort_order: 'asc' } },
        winners: {
          where: { isValid: true },
          include: { prize: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: giveaways });
  } catch (error) {
    console.error('取得抽獎列表失敗:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

// POST /api/giveaway - 建立抽獎活動
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, postId, post_url, name, filters, prizes } = body;

    if (typeof pageId !== 'string' || pageId.trim().length === 0) {
      return NextResponse.json({ error: '無效的 pageId' }, { status: 400 });
    }
    if (typeof postId !== 'string' || postId.trim().length === 0) {
      return NextResponse.json({ error: '無效的 postId' }, { status: 400 });
    }
    if (post_url !== undefined) {
      if (typeof post_url !== 'string') {
        return NextResponse.json({ error: '無效的 post_url 格式' }, { status: 400 });
      }
      try {
        const u = new URL(post_url);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
      } catch {
        return NextResponse.json({ error: '無效的 post_url 格式' }, { status: 400 });
      }
    }
    const filtersError = validateGiveawayFilters(filters);
    if (filtersError) {
      return NextResponse.json({ error: filtersError }, { status: 400 });
    }
    if (!Array.isArray(prizes) || prizes.length === 0) {
      return NextResponse.json({ error: '缺少獎項' }, { status: 400 });
    }
    for (const p of prizes) {
      if (typeof p.name !== 'string' || p.name.trim().length === 0) {
        return NextResponse.json({ error: '獎項名稱不得為空' }, { status: 400 });
      }
      const qty = Number(p.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return NextResponse.json({ error: '獎項數量需為 1~100 的整數' }, { status: 400 });
      }
    }

    const giveaway = await prisma.giveaway.create({
      data: {
        userId: session.user.id,
        pageId: pageId.trim(),
        postId: postId.trim(),
        post_url: typeof post_url === 'string' ? post_url.trim() : undefined,
        name: typeof name === 'string' ? name.trim() : undefined,
        filters,
        prizes: {
          create: prizes.map((p: { name: string; quantity: number }, i: number) => ({
            name: p.name.trim(),
            quantity: Number(p.quantity),
            sort_order: i,
          })),
        },
      },
      include: {
        prizes: { orderBy: { sort_order: 'asc' } },
      },
    });

    return NextResponse.json({ data: giveaway });
  } catch (error) {
    console.error('建立抽獎失敗:', error);
    return NextResponse.json({ error: '建立失敗' }, { status: 500 });
  }
}
