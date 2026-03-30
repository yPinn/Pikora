import { describe, expect, it } from 'vitest';

import { validateGiveawayFilters } from '@/lib/giveaway/types';

describe('validateGiveawayFilters', () => {
  it('空物件通過驗證', () => {
    expect(validateGiveawayFilters({})).toBeNull();
  });

  it('非物件型別回傳錯誤', () => {
    expect(validateGiveawayFilters(null)).not.toBeNull();
    expect(validateGiveawayFilters('string')).not.toBeNull();
    expect(validateGiveawayFilters([])).not.toBeNull();
    expect(validateGiveawayFilters(42)).not.toBeNull();
  });

  it('不允許的欄位回傳錯誤', () => {
    expect(validateGiveawayFilters({ unknown_field: true })).toMatch(/不允許的篩選欄位/);
  });

  // time
  it('time_start/time_end 為字串時通過', () => {
    expect(
      validateGiveawayFilters({ time_start: '2024-01-01', time_end: '2024-12-31' })
    ).toBeNull();
  });

  it('time_start 非字串回傳錯誤', () => {
    expect(validateGiveawayFilters({ time_start: 123 })).not.toBeNull();
  });

  // pattern
  it('contains pattern 通過', () => {
    expect(validateGiveawayFilters({ pattern: '參加', pattern_type: 'contains' })).toBeNull();
  });

  it('安全 regex pattern 通過', () => {
    expect(validateGiveawayFilters({ pattern: '^\\d+$', pattern_type: 'regex' })).toBeNull();
  });

  it('巢狀量詞 regex 被拒絕', () => {
    expect(validateGiveawayFilters({ pattern: '(a+)+', pattern_type: 'regex' })).toMatch(/不安全/);
  });

  it('bounded quantifier 巢狀被拒絕', () => {
    expect(validateGiveawayFilters({ pattern: '(a{1,10}){2}', pattern_type: 'regex' })).toMatch(
      /不安全/
    );
  });

  it('反向引用被拒絕', () => {
    expect(validateGiveawayFilters({ pattern: '(a)\\1', pattern_type: 'regex' })).toMatch(/不安全/);
  });

  it('pattern 超過 500 字元被拒絕', () => {
    expect(validateGiveawayFilters({ pattern: 'a'.repeat(501) })).not.toBeNull();
  });

  it('無效 pattern_type 被拒絕', () => {
    expect(validateGiveawayFilters({ pattern_type: 'fuzzy' })).not.toBeNull();
  });

  // min_mentions
  it('min_mentions 0~20 通過', () => {
    expect(validateGiveawayFilters({ min_mentions: 0 })).toBeNull();
    expect(validateGiveawayFilters({ min_mentions: 20 })).toBeNull();
  });

  it('min_mentions 超出範圍被拒絕', () => {
    expect(validateGiveawayFilters({ min_mentions: -1 })).not.toBeNull();
    expect(validateGiveawayFilters({ min_mentions: 21 })).not.toBeNull();
  });

  // allow_duplicate / duplicate_condition
  it('allow_duplicate 為 boolean 通過', () => {
    expect(validateGiveawayFilters({ allow_duplicate: true })).toBeNull();
  });

  it('allow_duplicate 非 boolean 被拒絕', () => {
    expect(validateGiveawayFilters({ allow_duplicate: 'yes' })).not.toBeNull();
  });

  it('duplicate_condition unique_mentions 通過', () => {
    expect(validateGiveawayFilters({ duplicate_condition: 'unique_mentions' })).toBeNull();
  });

  it('無效 duplicate_condition 被拒絕', () => {
    expect(validateGiveawayFilters({ duplicate_condition: 'all' })).not.toBeNull();
  });

  // allowed_reactions
  it('有效 allowed_reactions 通過', () => {
    expect(validateGiveawayFilters({ allowed_reactions: ['LIKE', 'LOVE'] })).toBeNull();
  });

  it('無效反應類型被拒絕', () => {
    expect(validateGiveawayFilters({ allowed_reactions: ['LIKE', 'THUMBSUP'] })).toMatch(
      /無效的反應類型/
    );
  });

  it('allowed_reactions 超過 10 個被拒絕', () => {
    expect(validateGiveawayFilters({ allowed_reactions: Array(11).fill('LIKE') })).not.toBeNull();
  });

  // require_reaction
  it('require_reaction 為 boolean 通過', () => {
    expect(validateGiveawayFilters({ require_reaction: false })).toBeNull();
  });
});
