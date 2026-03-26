/**
 * Facebook 解除安裝回呼
 * 當用戶移除應用程式時，Facebook 會呼叫此 endpoint
 * 處理：撤銷 OAuth tokens 與 Sessions，保留抽獎歷史資料
 */

import { type NextRequest, NextResponse } from 'next/server';

import { createLogger, maskId } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { parseSignedRequest } from '@/lib/utils/meta-webhook';

const logger = createLogger('deauthorize');

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
      await prisma.session.deleteMany({ where: { userId: account.userId } });

      logger.warn(`Revoked tokens and sessions for Facebook user ${maskId(facebookUserId)}`);
    } else {
      logger.warn(`Facebook user ${maskId(facebookUserId)} not found, skipping`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to process deauthorize request' }, { status: 500 });
  }
}
