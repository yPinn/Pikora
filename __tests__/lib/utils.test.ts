import { afterEach, describe, expect, it } from 'vitest';

import { apiPath, cn, getBasePath } from '@/lib/utils';

// ── cn ────────────────────────────────────────────────────────────────────────

describe('cn', () => {
  it('合併多個 class', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('過濾 falsy 條件式 class', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('過濾 undefined', () => {
    expect(cn('a', undefined, 'c')).toBe('a c');
  });

  it('Tailwind 衝突 class 取後者（px-2 vs px-4）', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('無輸入回傳空字串', () => {
    expect(cn()).toBe('');
  });

  it('接受物件語法', () => {
    expect(cn({ flex: true, hidden: false })).toBe('flex');
  });
});

// ── getBasePath ───────────────────────────────────────────────────────────────

describe('getBasePath', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    }
  });

  it('未設定環境變數時回傳空字串', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getBasePath()).toBe('');
  });

  it('根路徑 URL 回傳空字串', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
    expect(getBasePath()).toBe('');
  });

  it('根路徑加斜線 URL 回傳空字串', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/';
    expect(getBasePath()).toBe('');
  });

  it('帶路徑的 URL 回傳路徑部分', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/pikora';
    expect(getBasePath()).toBe('/pikora');
  });

  it('結尾斜線被去除', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/pikora/';
    expect(getBasePath()).toBe('/pikora');
  });

  it('巢狀路徑保留完整路徑', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/app/pikora';
    expect(getBasePath()).toBe('/app/pikora');
  });

  it('無效 URL 回傳空字串', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'not-a-url';
    expect(getBasePath()).toBe('');
  });
});

// ── apiPath ───────────────────────────────────────────────────────────────────

describe('apiPath', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    }
  });

  it('無 base path 時直接回傳路徑', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(apiPath('/api/test')).toBe('/api/test');
  });

  it('有 base path 時加上前綴', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/pikora';
    expect(apiPath('/api/test')).toBe('/pikora/api/test');
  });

  it('多層 API 路徑正確組合', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/app';
    expect(apiPath('/api/giveaway/blacklist')).toBe('/app/api/giveaway/blacklist');
  });
});
