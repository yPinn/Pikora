import type { FacebookComment } from '@/lib/services/facebook';

import { toDrawEntry } from './types';

import type { DrawEntry, GiveawayFilters, FilterStats } from './types';

// 計算留言中 @mention 的數量
// 匹配 Facebook 用戶名：@ 後接字母、數字、中文、底線、點
export function countMentions(message: string): number {
  if (!message) return 0;
  const matches = message.match(/@[\w\u4e00-\u9fff][\w\u4e00-\u9fff.]*/g);
  return matches?.length ?? 0;
}

// 檢查留言是否符合時間條件
function matchesTimeFilter(comment: FacebookComment, filters: GiveawayFilters): boolean {
  if (!filters.time_start && !filters.time_end) return true;

  const commentTime = new Date(comment.created_time).getTime();

  if (filters.time_start && commentTime < new Date(filters.time_start).getTime()) {
    return false;
  }
  if (filters.time_end && commentTime > new Date(filters.time_end).getTime()) {
    return false;
  }
  return true;
}

// 檢查留言是否符合格式條件
function matchesPatternFilter(comment: FacebookComment, filters: GiveawayFilters): boolean {
  if (!filters.pattern) return true;
  if (!comment.message) return false;

  const message = filters.pattern_case_sensitive ? comment.message : comment.message.toLowerCase();
  const pattern = filters.pattern_case_sensitive ? filters.pattern : filters.pattern.toLowerCase();

  if (filters.pattern_type === 'regex') {
    try {
      const flags = filters.pattern_case_sensitive ? '' : 'i';
      const regex = new RegExp(filters.pattern, flags);
      return regex.test(comment.message);
    } catch {
      return false;
    }
  }

  return message.includes(pattern);
}

// 檢查留言是否符合 @mention 條件
function matchesMentionFilter(comment: FacebookComment, filters: GiveawayFilters): boolean {
  if (!filters.min_mentions || filters.min_mentions <= 0) return true;
  return countMentions(comment.message || '') >= filters.min_mentions;
}

// 取得留言中的 @mention 集合 (排序後作為唯一鍵)
function getMentionKey(message: string): string {
  if (!message) return '';
  const matches = message.match(/@[\w\u4e00-\u9fff][\w\u4e00-\u9fff.]*/g);
  if (!matches) return '';
  return [...new Set(matches)].sort().join(',');
}

// 加密安全的隨機索引
function secureRandomIndex(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

// 建立抽獎池
export function buildDrawPool(
  comments: FacebookComment[],
  filters: GiveawayFilters,
  blacklist: Set<string>
): { pool: DrawEntry[]; stats: FilterStats } {
  const stats: FilterStats = {
    total_comments: comments.length,
    after_time_filter: 0,
    after_pattern_filter: 0,
    after_mention_filter: 0,
    after_blacklist_filter: 0,
    final_pool_size: 0,
    unique_users: 0,
  };

  // 篩選流程
  let filtered = comments.filter((c) => matchesTimeFilter(c, filters));
  stats.after_time_filter = filtered.length;

  filtered = filtered.filter((c) => matchesPatternFilter(c, filters));
  stats.after_pattern_filter = filtered.length;

  filtered = filtered.filter((c) => matchesMentionFilter(c, filters));
  stats.after_mention_filter = filtered.length;

  // 排除黑名單
  filtered = filtered.filter((c) => c.from?.id && !blacklist.has(c.from.id));
  stats.after_blacklist_filter = filtered.length;

  // 轉換為 DrawEntry
  const entries = filtered.map(toDrawEntry).filter((e): e is DrawEntry => e !== null);

  // 處理重複規則
  let pool: DrawEntry[];
  const userIds = new Set<string>();

  if (filters.allow_duplicate && filters.duplicate_condition === 'unique_mentions') {
    // 允許重複：同一用戶的每個不同 @mention 組合算一次機會
    const seenCombos = new Map<string, DrawEntry>(); // key: `userId|mentionKey`
    for (const entry of entries) {
      const mentionKey = getMentionKey(entry.comment_message);
      const comboKey = `${entry.from_id}|${mentionKey}`;
      if (!seenCombos.has(comboKey)) {
        seenCombos.set(comboKey, entry);
      }
    }
    pool = Array.from(seenCombos.values());
    pool.forEach((e) => userIds.add(e.from_id));
  } else if (filters.allow_duplicate) {
    // 允許重複：每則留言算一次機會
    pool = entries;
    entries.forEach((e) => userIds.add(e.from_id));
  } else {
    // 不允許重複：每人只算一次，從該用戶的所有留言中隨機選一則
    const userEntries = new Map<string, DrawEntry[]>();
    for (const entry of entries) {
      if (!userEntries.has(entry.from_id)) {
        userEntries.set(entry.from_id, []);
      }
      userEntries.get(entry.from_id)!.push(entry);
    }
    // 每個用戶隨機選一則留言
    pool = Array.from(userEntries.values()).map((userComments) => {
      const randomIndex = secureRandomIndex(userComments.length);
      return userComments[randomIndex];
    });
    pool.forEach((e) => userIds.add(e.from_id));
  }

  stats.final_pool_size = pool.length;
  stats.unique_users = userIds.size;

  return { pool, stats };
}

// 執行抽獎
export function drawWinners(
  pool: DrawEntry[],
  count: number,
  excludeUserIds: Set<string> = new Set()
): { winners: DrawEntry[]; remainingPool: DrawEntry[] } {
  // 複製 pool 並排除已中獎者
  let available = pool.filter((e) => !excludeUserIds.has(e.from_id));
  const winners: DrawEntry[] = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const randomIndex = secureRandomIndex(available.length);
    const winner = available[randomIndex];
    winners.push(winner);

    // 移除該用戶的所有 entries
    available = available.filter((e) => e.from_id !== winner.from_id);
  }

  return { winners, remainingPool: available };
}
