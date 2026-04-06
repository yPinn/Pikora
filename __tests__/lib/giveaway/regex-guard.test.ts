import { describe, expect, it } from 'vitest';

import { isSafeRegex } from '@/lib/giveaway/regex-guard';

describe('isSafeRegex', () => {
  // ── 長度限制 ──────────────────────────────────────────────────────────────

  it('空字串是安全的', () => {
    expect(isSafeRegex('')).toBe(true);
  });

  it('簡單字串 pattern 是安全的', () => {
    expect(isSafeRegex('hello')).toBe(true);
  });

  it('恰好 200 字元被接受', () => {
    expect(isSafeRegex('a'.repeat(200))).toBe(true);
  });

  it('超過 200 字元被拒絕', () => {
    expect(isSafeRegex('a'.repeat(201))).toBe(false);
  });

  // ── 巢狀量詞（NESTED_QUANTIFIER） ────────────────────────────────────────

  it('巢狀量詞 (a+)+ 被拒絕', () => {
    expect(isSafeRegex('(a+)+')).toBe(false);
  });

  it('巢狀量詞 (a*)* 被拒絕', () => {
    expect(isSafeRegex('(a*)*')).toBe(false);
  });

  it('巢狀量詞 (a+)* 被拒絕', () => {
    expect(isSafeRegex('(a+)*')).toBe(false);
  });

  it('巢狀量詞 (a+)? 被拒絕', () => {
    expect(isSafeRegex('(a+)?')).toBe(false);
  });

  it('安全的非巢狀量詞 a+ 被接受', () => {
    expect(isSafeRegex('a+')).toBe(true);
  });

  it('安全的群組不帶量詞 (abc) 被接受', () => {
    expect(isSafeRegex('(abc)')).toBe(true);
  });

  // ── bounded quantifier 巢狀 ───────────────────────────────────────────────

  it('(a{1,10}){1,10} 被拒絕', () => {
    expect(isSafeRegex('(a{1,10}){1,10}')).toBe(false);
  });

  it('(ab{2,5})+ 被拒絕', () => {
    expect(isSafeRegex('(ab{2,5})+')).toBe(false);
  });

  it('安全的 bounded quantifier a{3,5} 被接受', () => {
    expect(isSafeRegex('a{3,5}')).toBe(true);
  });

  // ── 交替量詞（ALTERNATION_QUANTIFIER） ──────────────────────────────────

  it('(a|b)+ 被拒絕', () => {
    expect(isSafeRegex('(a|b)+')).toBe(false);
  });

  it('(foo|bar)* 被拒絕', () => {
    expect(isSafeRegex('(foo|bar)*')).toBe(false);
  });

  it('(x|y|z)+ 被拒絕', () => {
    expect(isSafeRegex('(x|y|z)+')).toBe(false);
  });

  it('安全的交替無量詞 (a|b) 被接受', () => {
    expect(isSafeRegex('(a|b)')).toBe(true);
  });

  // ── 反向引用 ──────────────────────────────────────────────────────────────

  it('反向引用 (a)\\1 被拒絕', () => {
    expect(isSafeRegex('(a)\\1')).toBe(false);
  });

  it('反向引用 \\2 被拒絕', () => {
    expect(isSafeRegex('(a)(b)\\2')).toBe(false);
  });

  it('反向引用 \\9 被拒絕', () => {
    expect(isSafeRegex('(a)(b)(c)(d)(e)(f)(g)(h)(i)\\9')).toBe(false);
  });

  // ── 安全的實際使用 pattern ─────────────────────────────────────────────

  it('@mention pattern 是安全的', () => {
    expect(isSafeRegex('@\\w+')).toBe(true);
  });

  it('數字 pattern 是安全的', () => {
    expect(isSafeRegex('\\d+')).toBe(true);
  });

  it('中文字串 pattern 是安全的', () => {
    expect(isSafeRegex('抽獎')).toBe(true);
  });

  it('含有跳脫字元的 pattern 是安全的', () => {
    expect(isSafeRegex('抽獎\\+\\d')).toBe(true);
  });

  it('字元類別 [a-z]+ 是安全的', () => {
    expect(isSafeRegex('[a-z]+')).toBe(true);
  });
});
