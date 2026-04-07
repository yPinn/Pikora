import { describe, expect, it } from 'vitest';

import { buildDrawPool, countMentions, drawWinners } from '@/lib/giveaway/filters';
import type { GiveawayFilters } from '@/lib/giveaway/types';
import type { FacebookComment } from '@/lib/services/facebook';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeComment(
  id: string,
  fromId: string,
  fromName: string,
  overrides: Partial<FacebookComment> = {}
): FacebookComment {
  return {
    id,
    message: overrides.message ?? '測試留言',
    created_time: overrides.created_time ?? '2024-06-01T10:00:00Z',
    from: { id: fromId, name: fromName },
    ...overrides,
  };
}

const NO_FILTERS: GiveawayFilters = {};

// ── countMentions ─────────────────────────────────────────────────────────────

describe('countMentions', () => {
  it('空字串回傳 0', () => {
    expect(countMentions('')).toBe(0);
  });

  it('無 mention 回傳 0', () => {
    expect(countMentions('hello world')).toBe(0);
  });

  it('單一英文 mention', () => {
    expect(countMentions('@alice')).toBe(1);
  });

  it('多個 mention', () => {
    expect(countMentions('@alice @bob @carol')).toBe(3);
  });

  it('中文名稱 mention', () => {
    expect(countMentions('@張三 @李四')).toBe(2);
  });

  it('重複 mention 各自計算', () => {
    expect(countMentions('@alice @alice')).toBe(2);
  });
});

// ── buildDrawPool ─────────────────────────────────────────────────────────────

describe('buildDrawPool', () => {
  const comments = [
    makeComment('c1', 'u1', 'Alice'),
    makeComment('c2', 'u2', 'Bob'),
    makeComment('c3', 'u3', 'Carol'),
  ];

  it('無篩選：全部進入抽獎池', () => {
    const { pool, stats } = buildDrawPool(comments, NO_FILTERS, new Set());
    expect(pool).toHaveLength(3);
    expect(stats.total_comments).toBe(3);
    expect(stats.final_pool_size).toBe(3);
  });

  it('黑名單：排除指定用戶', () => {
    const { pool } = buildDrawPool(comments, NO_FILTERS, new Set(['u1']));
    expect(pool.map((e) => e.from_id)).not.toContain('u1');
    expect(pool).toHaveLength(2);
  });

  it('時間篩選：排除時間範圍外的留言', () => {
    const mixed = [
      makeComment('c1', 'u1', 'Alice', { created_time: '2024-01-01T00:00:00Z' }),
      makeComment('c2', 'u2', 'Bob', { created_time: '2024-06-01T00:00:00Z' }),
    ];
    const { pool } = buildDrawPool(mixed, { time_start: '2024-03-01T00:00:00Z' }, new Set());
    expect(pool).toHaveLength(1);
    expect(pool[0].from_id).toBe('u2');
  });

  it('關鍵字篩選（contains）：只留符合的留言', () => {
    const mixed = [
      makeComment('c1', 'u1', 'Alice', { message: '我要參加' }),
      makeComment('c2', 'u2', 'Bob', { message: '不參加' }),
    ];
    const { pool } = buildDrawPool(
      mixed,
      { pattern: '我要參加', pattern_type: 'contains' },
      new Set()
    );
    expect(pool).toHaveLength(1);
    expect(pool[0].from_id).toBe('u1');
  });

  it('正則篩選（regex）：使用安全 pattern', () => {
    const mixed = [
      makeComment('c1', 'u1', 'Alice', { message: '抽獎+1' }),
      makeComment('c2', 'u2', 'Bob', { message: '隨便說' }),
    ];
    const { pool } = buildDrawPool(
      mixed,
      { pattern: '抽獎\\+\\d', pattern_type: 'regex' },
      new Set()
    );
    expect(pool).toHaveLength(1);
  });

  it('危險 regex（巢狀量詞）：拒絕並排除所有留言', () => {
    const mixed = [makeComment('c1', 'u1', 'Alice', { message: 'aaaa' })];
    // (a+)+ 是 ReDoS 危險 pattern
    const { pool } = buildDrawPool(mixed, { pattern: '(a+)+', pattern_type: 'regex' }, new Set());
    expect(pool).toHaveLength(0);
  });

  it('危險 regex（bounded quantifier 巢狀）：被拒絕', () => {
    const mixed = [makeComment('c1', 'u1', 'Alice', { message: 'aaa' })];
    const { pool } = buildDrawPool(
      mixed,
      { pattern: '(a{1,10}){1,10}', pattern_type: 'regex' },
      new Set()
    );
    expect(pool).toHaveLength(0);
  });

  it('危險 regex（反向引用）：被拒絕', () => {
    const mixed = [makeComment('c1', 'u1', 'Alice', { message: 'aa' })];
    const { pool } = buildDrawPool(mixed, { pattern: '(a)\\1', pattern_type: 'regex' }, new Set());
    expect(pool).toHaveLength(0);
  });

  it('@mention 篩選：min_mentions=2 排除 mention 不足的留言', () => {
    const mixed = [
      makeComment('c1', 'u1', 'Alice', { message: '@bob' }),
      makeComment('c2', 'u2', 'Bob', { message: '@alice @carol' }),
    ];
    const { pool } = buildDrawPool(mixed, { min_mentions: 2 }, new Set());
    expect(pool).toHaveLength(1);
    expect(pool[0].from_id).toBe('u2');
  });

  it('require_reaction：無 reactor 資料時清空抽獎池', () => {
    const { pool } = buildDrawPool(comments, { require_reaction: true }, new Set(), new Set());
    expect(pool).toHaveLength(0);
  });

  it('require_reaction：有 reactor 資料時只留有反應的用戶', () => {
    const { pool } = buildDrawPool(
      comments,
      { require_reaction: true },
      new Set(),
      new Set(['u1', 'u3'])
    );
    expect(pool.map((e) => e.from_id)).toEqual(expect.arrayContaining(['u1', 'u3']));
    expect(pool.map((e) => e.from_id)).not.toContain('u2');
  });

  it('allow_duplicate=false：stats.final_pool_size 等於不重複用戶數', () => {
    const dup = [
      makeComment('c1', 'u1', 'Alice'),
      makeComment('c2', 'u1', 'Alice'), // 同用戶
      makeComment('c3', 'u2', 'Bob'),
    ];
    const { stats } = buildDrawPool(dup, { allow_duplicate: false }, new Set());
    expect(stats.unique_users).toBe(2);
    expect(stats.final_pool_size).toBe(2);
  });

  it('沒有 from.id 的留言以匿名身份進入 pool，is_anonymous 為 true', () => {
    const noFrom: FacebookComment = {
      id: 'cx',
      message: '留言',
      created_time: '2024-01-01T00:00:00Z',
    };
    const { pool, stats } = buildDrawPool([noFrom], NO_FILTERS, new Set());
    expect(pool).toHaveLength(1);
    expect(pool[0].is_anonymous).toBe(true);
    expect(pool[0].from_id).toBe('anon_cx');
    expect(stats.anonymous_comments).toBe(1);
  });
});

// ── drawWinners ───────────────────────────────────────────────────────────────

describe('drawWinners', () => {
  function makePool(ids: string[]) {
    return ids.map((id) => ({
      from_id: id,
      from_name: `User ${id}`,
      is_anonymous: false,
      comment_id: `comment_${id}`,
      comment_message: '留言',
      comment_created_time: '2024-06-01T10:00:00Z',
    }));
  }

  it('抽出指定數量的獲獎者', () => {
    const pool = makePool(['u1', 'u2', 'u3', 'u4', 'u5']);
    const { winners } = drawWinners(pool, 3);
    expect(winners).toHaveLength(3);
  });

  it('不超過 pool 大小', () => {
    const pool = makePool(['u1', 'u2']);
    const { winners } = drawWinners(pool, 10);
    expect(winners).toHaveLength(2);
  });

  it('同一用戶不會重複中獎', () => {
    const pool = makePool(['u1', 'u1', 'u1', 'u2']);
    const { winners } = drawWinners(pool, 2, new Set(), true);
    const ids = winners.map((w) => w.from_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('excludeUserIds：排除已中獎用戶', () => {
    const pool = makePool(['u1', 'u2', 'u3']);
    const { winners } = drawWinners(pool, 2, new Set(['u1']));
    expect(winners.map((w) => w.from_id)).not.toContain('u1');
  });

  it('remainingPool 不包含已抽出的用戶', () => {
    const pool = makePool(['u1', 'u2', 'u3']);
    const { winners, remainingPool } = drawWinners(pool, 1);
    const winnerIds = new Set(winners.map((w) => w.from_id));
    remainingPool.forEach((e) => {
      expect(winnerIds.has(e.from_id)).toBe(false);
    });
  });

  it('空 pool 回傳空陣列', () => {
    const { winners, remainingPool } = drawWinners([], 3);
    expect(winners).toHaveLength(0);
    expect(remainingPool).toHaveLength(0);
  });
});
