/**
 * Meta Webhook 路由
 * GET /api/webhook - Webhook 驗證
 * POST /api/webhook - 接收 Webhook 事件
 */

import { type NextRequest, NextResponse } from 'next/server';

import crypto from 'crypto';

import { type WebhookPayload } from '@/lib/services';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.META_APP_SECRET;

/**
 * Webhook 驗證 (GET)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (!VERIFY_TOKEN) {
    console.error('未設定 META_WEBHOOK_VERIFY_TOKEN 環境變數');
    return new NextResponse('Server configuration error', { status: 500 });
  }

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('Webhook 驗證失敗', { mode, tokenMatch: token === VERIFY_TOKEN });
  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * 接收 Webhook 事件 (POST)
 */
export async function POST(request: NextRequest) {
  try {
    if (!APP_SECRET) {
      console.error('未設定 META_APP_SECRET 環境變數');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    if (!signature) {
      console.warn('缺少 x-hub-signature-256 標頭');
      return new NextResponse('Missing signature', { status: 401 });
    }

    const expectedSignature =
      'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.warn('Webhook 簽名驗證失敗');
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const payload: WebhookPayload = JSON.parse(rawBody);
    await handleWebhookPayload(payload);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('處理 Webhook 事件失敗:', error);
    return new NextResponse('OK', { status: 200 });
  }
}

/**
 * 處理 Webhook Payload
 */
async function handleWebhookPayload(payload: WebhookPayload): Promise<void> {
  const { object, entry } = payload;

  for (const item of entry) {
    switch (object) {
      case 'page':
        await handlePageEvent(item);
        break;
      case 'instagram':
        await handleInstagramEvent(item);
        break;
      default:
      // 未處理的事件類型
    }
  }
}

/**
 * 處理 Facebook Page 事件
 */
async function handlePageEvent(entry: WebhookPayload['entry'][0]): Promise<void> {
  const { changes, messaging } = entry;

  if (changes) {
    for (const change of changes) {
      switch (change.field) {
        case 'feed':
          // TODO: 實作留言處理邏輯
          break;
        case 'ratings':
          // TODO: 實作評價處理邏輯
          break;
        default:
        // 其他事件
      }
    }
  }

  if (messaging) {
    for (const _message of messaging) {
      // TODO: 實作私訊處理邏輯
    }
  }
}

/**
 * 處理 Instagram 事件
 */
async function handleInstagramEvent(entry: WebhookPayload['entry'][0]): Promise<void> {
  const { changes } = entry;

  if (!changes) return;

  for (const change of changes) {
    switch (change.field) {
      case 'comments':
        // TODO: 實作留言處理邏輯
        break;
      case 'mentions':
        // TODO: 實作提及處理邏輯
        break;
      case 'story_insights':
        // TODO: 實作限動分析處理邏輯
        break;
      default:
      // 其他事件
    }
  }
}
