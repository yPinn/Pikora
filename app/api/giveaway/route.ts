import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
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
        winners: { where: { isValid: true } },
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

    if (!pageId || !postId || !filters || !prizes?.length) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const giveaway = await prisma.giveaway.create({
      data: {
        userId: session.user.id,
        pageId,
        postId,
        post_url,
        name,
        filters,
        prizes: {
          create: prizes.map((p: { name: string; quantity: number }, i: number) => ({
            name: p.name,
            quantity: p.quantity,
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
