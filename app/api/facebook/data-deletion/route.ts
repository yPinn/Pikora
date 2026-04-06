/**
 * Facebook 資料刪除回呼
 * 當用戶要求刪除資料時，Facebook 會呼叫此 endpoint
 * Meta 平台政策要求：必須實際刪除用戶所有資料
 */

import { type NextRequest, NextResponse } from 'next/server';

import { createHash } from 'crypto';

import { createLogger, maskId } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { parseSignedRequest } from '@/lib/utils/meta-webhook';

const logger = createLogger('facebook/data-deletion');

export async function POST(request: NextRequest) {
  try {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const contentType = request.headers.get('content-type') || '';
    let signedRequest: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      signedRequest = formData.get('signed_request') as string | null;
    } else {
      const body = await request.json().catch(() => null);
      signedRequest = body?.signed_request ?? null;
    }

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
    }

    const data = parseSignedRequest(signedRequest, appSecret);
    if (!data) {
      return NextResponse.json({ error: 'Invalid signed_request' }, { status: 400 });
    }

    const facebookUserId = data.user_id as string | undefined;
    if (!facebookUserId) {
      return NextResponse.json({ error: 'Missing user_id in payload' }, { status: 400 });
    }

    // 找到對應的系統用戶（透過 Facebook OAuth account）
    const account = await prisma.account.findFirst({
      where: { provider: 'facebook', providerAccountId: facebookUserId },
      select: { userId: true },
    });

    if (account) {
      const { userId } = account;

      await prisma.$transaction(async (tx) => {
        // 刪除 Giveaway（Cascade 自動刪除 Prize、Winner）
        await tx.giveaway.deleteMany({ where: { userId } });
        // 刪除黑名單
        await tx.giveawayBlacklist.deleteMany({ where: { userId } });
        // 刪除 User（Cascade 自動刪除 Account、Session）
        await tx.user.delete({ where: { id: userId } });
      });

      logger.info('Deleted all data for Facebook user', { userId: maskId(facebookUserId) });
    } else {
      // 用戶不存在於系統中，視為已刪除
      logger.info('Facebook user not found, skipping', { userId: maskId(facebookUserId) });
    }

    const idHash = createHash('sha256').update(facebookUserId).digest('hex').slice(0, 12);
    const confirmationCode = `DEL_${idHash}_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      logger.error('NEXT_PUBLIC_APP_URL is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    return NextResponse.json({
      url: `${appUrl}/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process deletion request' }, { status: 500 });
  }
}
