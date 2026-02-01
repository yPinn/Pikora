/**
 * Facebook 解除安裝回呼
 * 當用戶移除應用程式時，Facebook 會呼叫此 endpoint
 */

import { NextResponse } from 'next/server';

export async function POST() {
  // 這裡可以處理用戶移除應用程式的邏輯
  // 例如：清除用戶的 access token、標記帳號狀態等

  return NextResponse.json({ success: true });
}
