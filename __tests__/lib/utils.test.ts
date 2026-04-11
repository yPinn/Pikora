import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

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
