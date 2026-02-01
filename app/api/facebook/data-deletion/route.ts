/**
 * Facebook 資料刪除回呼
 * 當用戶要求刪除資料時，Facebook 會呼叫此 endpoint
 */

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Facebook 會發送 signed_request 參數
    // 這裡可以處理用戶資料刪除的邏輯

    // 回傳確認碼和狀態查詢網址（Facebook 要求的格式）
    const confirmationCode = `DEL_${Date.now()}`;

    return NextResponse.json({
      url: `https://pikora.vercel.app/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process deletion request' }, { status: 500 });
  }
}
