/**
 * Facebook 解除安裝回呼
 * 當用戶移除應用程式時，Facebook 會呼叫此 endpoint
 * 處理：撤銷 OAuth tokens 與 Sessions，保留抽獎歷史資料
 */

import { type NextRequest, NextResponse } from 'next/server';

import { createLogger, maskId } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { parseSignedRequest } from '@/lib/utils/meta-webhook';

const logger = createLogger('facebook/deauthorize');

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

    // 找到對應的 Account 記錄
    const account = await prisma.account.findFirst({
      where: { provider: 'facebook', providerAccountId: facebookUserId },
      select: { id: true, userId: true },
    });

    if (account) {
      // 刪除 OAuth Account（撤銷 access/refresh token 儲存）
      await prisma.account.delete({ where: { id: account.id } });

      // 刪除所有 Sessions（強制登出）
      // 注意：本專案使用 JWT session strategy，JWT 本身無法即時撤銷，
      // 需等待 token 自然過期（expiresAt）。已刪除 DB Sessions 僅對
      // database strategy 有即時效果。請確保 JWT maxAge 設定較短。
      await prisma.session.deleteMany({ where: { userId: account.userId } });

      logger.info(`Revoked tokens and sessions for Facebook user ${maskId(facebookUserId)}`);
    } else {
      logger.info(`Facebook user ${maskId(facebookUserId)} not found, skipping`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to process deauthorize request', error);
    return NextResponse.json({ error: 'Failed to process deauthorize request' }, { status: 500 });
  }
}
