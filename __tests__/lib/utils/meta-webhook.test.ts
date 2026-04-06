import crypto from 'crypto';

import { describe, expect, it } from 'vitest';

import { parseSignedRequest } from '@/lib/utils/meta-webhook';

// ── helpers ───────────────────────────────────────────────────────────────────

const APP_SECRET = 'test_app_secret_12345';

/**
 * 產生合法的 signed_request 字串
 */
function makeSignedRequest(payload: Record<string, unknown>, secret = APP_SECRET): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const sig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${sig}.${encodedPayload}`;
}

// ── parseSignedRequest ────────────────────────────────────────────────────────

describe('parseSignedRequest', () => {
  it('合法的 signed_request 正確解碼 payload', () => {
    const payload = { user_id: 'u123', algorithm: 'HMAC-SHA256' };
    const sr = makeSignedRequest(payload);
    const result = parseSignedRequest(sr, APP_SECRET);
    expect(result).toMatchObject(payload);
  });

  it('簽名不符（錯誤 secret）回傳 null', () => {
    const sr = makeSignedRequest({ user_id: 'u123' }, 'correct_secret');
    expect(parseSignedRequest(sr, 'wrong_secret')).toBeNull();
  });

  it('格式不是兩段（缺少點分隔）回傳 null', () => {
    expect(parseSignedRequest('invalidsignedrequest', APP_SECRET)).toBeNull();
  });

  it('格式超過兩段回傳 null', () => {
    expect(parseSignedRequest('a.b.c', APP_SECRET)).toBeNull();
  });

  it('payload 不是合法 JSON 回傳 null', () => {
    const badPayload = Buffer.from('not json').toString('base64url');
    const sig = crypto.createHmac('sha256', APP_SECRET).update(badPayload).digest('base64url');
    expect(parseSignedRequest(`${sig}.${badPayload}`, APP_SECRET)).toBeNull();
  });

  it('payload 內容可包含任意欄位', () => {
    const payload = {
      user_id: 'abc',
      expires: 9999999999,
      issued_at: 1000000000,
      oauth_token: 'tok',
    };
    const sr = makeSignedRequest(payload);
    const result = parseSignedRequest(sr, APP_SECRET);
    expect(result?.user_id).toBe('abc');
    expect(result?.oauth_token).toBe('tok');
  });

  it('空 payload 物件也能正常解碼', () => {
    const sr = makeSignedRequest({});
    const result = parseSignedRequest(sr, APP_SECRET);
    expect(result).toEqual({});
  });
});
