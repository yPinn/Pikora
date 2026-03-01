/**
 * Facebook 資料刪除回呼
 * 當用戶要求刪除資料時，Facebook 會呼叫此 endpoint
 */

import { type NextRequest, NextResponse } from 'next/server';

import crypto from 'crypto';

function parseSignedRequest(
  signedRequest: string,
  appSecret: string
): Record<string, unknown> | null {
  const parts = signedRequest.split('.');
  if (parts.length !== 2) return null;
  const [encodedSig, payload] = parts;

  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const expectedSig = crypto.createHmac('sha256', appSecret).update(payload).digest();

  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(sig, expectedSig)) return null;

  try {
    return JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    );
  } catch {
    return null;
  }
}

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

    const confirmationCode = `DEL_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pikora.vercel.app';

    return NextResponse.json({
      url: `${appUrl}/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process deletion request' }, { status: 500 });
  }
}
