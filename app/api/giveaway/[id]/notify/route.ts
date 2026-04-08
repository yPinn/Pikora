/**
 * POST /api/giveaway/[id]/notify
 *
 * 對指定活動的中獎者（或單一中獎者）在原留言下方回覆通知。
 *
 * Body:
 *   pageId      string    - Facebook 粉專 ID
 *   winnerIds   string[]  - 要通知的 Winner.id 陣列（空陣列 = 全部未通知者）
 *   template    string    - 回覆訊息模板（含 {{winnerName}}、{{prizeName}} 變數）
 *
 * DELETE /api/giveaway/[id]/notify?winnerId=xxx
 *
 * 清除指定中獎者的通知記錄（notified_at / comment_reply_id 重置為 null）。
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getRequestAccessToken } from '@/lib/auth/get-server-token';
import { renderTemplate } from '@/lib/giveaway/template';
import { createLogger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { getMetaServices, MetaApiException } from '@/lib/services';
import { FACEBOOK_ID_PATTERN } from '@/lib/utils/facebook';

const logger = createLogger('giveaway/notify');

type RouteParams = { params: Promise<{ id: string }> };

const MAX_TEMPLATE_LENGTH = 500;

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const accessToken = await getRequestAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: giveawayId } = await params;

    const body = await request.json();
    const { pageId, winnerIds, template } = body;

    // ── 輸入驗證 ────────────────────────────────────────────────────
    if (typeof pageId !== 'string' || !FACEBOOK_ID_PATTERN.test(pageId.trim())) {
      return NextResponse.json({ error: '無效的 pageId' }, { status: 400 });
    }
    if (!Array.isArray(winnerIds) || winnerIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'winnerIds 格式錯誤' }, { status: 400 });
    }
    if (winnerIds.length > 200) {
      return NextResponse.json({ error: 'winnerIds 數量超過上限 (200)' }, { status: 400 });
    }
    if (
      typeof template !== 'string' ||
      template.trim().length === 0 ||
      template.length > MAX_TEMPLATE_LENGTH
    ) {
      return NextResponse.json(
        { error: `template 不得為空且長度上限為 ${MAX_TEMPLATE_LENGTH} 字元` },
        { status: 400 }
      );
    }

    // ── 驗證活動所有權 ───────────────────────────────────────────────
    const giveaway = await prisma.giveaway.findFirst({
      where: { id: giveawayId, pageId: pageId.trim() },
      include: {
        winners: {
          where: {
            isValid: true,
            ...(winnerIds.length > 0 ? { id: { in: winnerIds } } : { notified_at: null }),
          },
          include: { prize: { select: { name: true } } },
        },
      },
    });

    if (!giveaway) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 });
    }

    if (giveaway.winners.length === 0) {
      return NextResponse.json({ error: '沒有符合條件的中獎者' }, { status: 400 });
    }

    // ── 取得 Page Access Token ──────────────────────────────────────
    const { facebook } = getMetaServices();
    const pageAccessToken = await facebook.getPageAccessToken(pageId.trim(), accessToken);

    // ── 逐一回覆留言 ────────────────────────────────────────────────
    const results: { winnerId: string; success: boolean; error?: string }[] = [];

    for (const winner of giveaway.winners) {
      const message =
        `@[${winner.from_id}] ` +
        renderTemplate(template, {
          winnerName: winner.from_name,
          prizeName: winner.prize.name,
        });

      try {
        const reply = await facebook.replyToComment(winner.comment_id, pageAccessToken, message);
        await prisma.winner.update({
          where: { id: winner.id },
          data: {
            notified_at: new Date(),
            comment_reply_id: reply.id,
          },
        });
        results.push({ winnerId: winner.id, success: true });
      } catch (err) {
        logger.error('Failed to notify winner', { winnerId: winner.id, error: err });
        const errorMessage =
          err instanceof MetaApiException ? err.getUserFriendlyMessage() : '回覆失敗';
        results.push({ winnerId: winner.id, success: false, error: errorMessage });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      data: { results, successCount, failCount },
    });
  } catch (error) {
    logger.error('Failed to send notifications', error);
    if (error instanceof MetaApiException) {
      return NextResponse.json({ error: error.getUserFriendlyMessage() }, { status: 500 });
    }
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const accessToken = await getRequestAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id: giveawayId } = await params;
    const winnerId = request.nextUrl.searchParams.get('winnerId');
    const pageId = request.nextUrl.searchParams.get('pageId');

    if (!winnerId) {
      return NextResponse.json({ error: '缺少 winnerId' }, { status: 400 });
    }
    if (!pageId || !FACEBOOK_ID_PATTERN.test(pageId.trim())) {
      return NextResponse.json({ error: '無效的 pageId' }, { status: 400 });
    }

    // 驗證活動所有權
    const winner = await prisma.winner.findFirst({
      where: { id: winnerId, giveawayId, giveaway: { pageId: pageId.trim() } },
    });

    if (!winner) {
      return NextResponse.json({ error: '找不到中獎紀錄' }, { status: 404 });
    }

    // 刪除 Facebook 留言回覆
    let fbDeleteError: string | null = null;
    if (winner.comment_reply_id) {
      try {
        const { facebook } = getMetaServices();
        const pageAccessToken = await facebook.getPageAccessToken(pageId.trim(), accessToken);
        await facebook.deleteComment(winner.comment_reply_id, pageAccessToken);
      } catch (err) {
        logger.error('Failed to delete Facebook comment', {
          commentId: winner.comment_reply_id,
          error: err,
        });
        fbDeleteError =
          err instanceof MetaApiException ? err.getUserFriendlyMessage() : 'Facebook 留言刪除失敗';
      }
    }

    if (fbDeleteError) {
      return NextResponse.json({ error: fbDeleteError }, { status: 500 });
    }

    await prisma.winner.update({
      where: { id: winnerId },
      data: { notified_at: null, comment_reply_id: null },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    logger.error('Failed to clear notification', error);
    return NextResponse.json({ error: '操作失敗，請稍後再試' }, { status: 500 });
  }
}
