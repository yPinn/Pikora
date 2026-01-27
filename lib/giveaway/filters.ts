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
  blacklist: Set<string>,
  reactorIds?: Set<string>
): { pool: DrawEntry[]; stats: FilterStats } {
  const stats: FilterStats = {
    total_comments: comments.length,
    after_time_filter: 0,
    after_pattern_filter: 0,
    after_mention_filter: 0,
    after_reaction_filter: 0,
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

  // 反應篩選：只保留有按讚/反應的用戶
  if (filters.require_reaction) {
    if (reactorIds && reactorIds.size > 0) {
      filtered = filtered.filter((c) => c.from?.id && reactorIds.has(c.from.id));
    } else {
      // 如果要求必須按讚但沒有反應者資料，則清空抽獎池
      filtered = [];
    }
  }
  stats.after_reaction_filter = filtered.length;

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
    // 不允許重複：保留所有留言，抽獎時再隨機選擇
    // 這樣重抽時可以顯示不同留言，增加視覺回饋
    pool = entries;
    entries.forEach((e) => userIds.add(e.from_id));
  }

  stats.final_pool_size = filters.allow_duplicate ? pool.length : userIds.size;
  stats.unique_users = userIds.size;

  return { pool, stats };
}

// 執行抽獎
export function drawWinners(
  pool: DrawEntry[],
  count: number,
  excludeUserIds: Set<string> = new Set(),
  allowDuplicate: boolean = false
): { winners: DrawEntry[]; remainingPool: DrawEntry[] } {
  // 複製 pool 並排除已中獎者
  let available = pool.filter((e) => !excludeUserIds.has(e.from_id));
  const winners: DrawEntry[] = [];

  if (allowDuplicate) {
    // 允許重複：直接從 pool 隨機選
    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = secureRandomIndex(available.length);
      const winner = available[randomIndex];
      winners.push(winner);
      // 移除該用戶的所有 entries（同一用戶不能重複中獎）
      available = available.filter((e) => e.from_id !== winner.from_id);
    }
  } else {
    // 不允許重複：先按用戶分組，隨機選用戶，再隨機選該用戶的留言
    // 這樣每次抽獎/重抽都會重新隨機選擇留言
    const userEntriesMap = new Map<string, DrawEntry[]>();
    for (const entry of available) {
      if (!userEntriesMap.has(entry.from_id)) {
        userEntriesMap.set(entry.from_id, []);
      }
      userEntriesMap.get(entry.from_id)!.push(entry);
    }

    const userIds = Array.from(userEntriesMap.keys());

    for (let i = 0; i < count && userIds.length > 0; i++) {
      // 隨機選一個用戶
      const userIndex = secureRandomIndex(userIds.length);
      const selectedUserId = userIds[userIndex];
      const userComments = userEntriesMap.get(selectedUserId)!;

      // 從該用戶的留言中隨機選一則
      const commentIndex = secureRandomIndex(userComments.length);
      const winner = userComments[commentIndex];
      winners.push(winner);

      // 移除該用戶
      userIds.splice(userIndex, 1);
      userEntriesMap.delete(selectedUserId);
    }

    // 重建 remainingPool
    available = [];
    for (const entries of userEntriesMap.values()) {
      available.push(...entries);
    }
  }

  return { winners, remainingPool: available };
}
