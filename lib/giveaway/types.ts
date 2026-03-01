import type { FacebookComment } from '@/lib/services/facebook';

// 篩選條件
export interface GiveawayFilters {
  time_start?: string;
  time_end?: string;
  pattern?: string;
  pattern_type?: 'contains' | 'regex';
  pattern_case_sensitive?: boolean;
  min_mentions?: number;
  allow_duplicate?: boolean;
  duplicate_condition?: 'unique_mentions';
  // 反應篩選
  require_reaction?: boolean;
  allowed_reactions?: string[]; // 空陣列 = 全部反應類型皆可
}

const VALID_FILTER_KEYS = new Set([
  'time_start',
  'time_end',
  'pattern',
  'pattern_type',
  'pattern_case_sensitive',
  'min_mentions',
  'allow_duplicate',
  'duplicate_condition',
  'require_reaction',
  'allowed_reactions',
]);

/**
 * 驗證 GiveawayFilters 物件（純 TS，不依賴 zod）
 * 回傳 null 表示驗證通過；否則回傳錯誤訊息。
 */
export function validateGiveawayFilters(filters: unknown): string | null {
  if (typeof filters !== 'object' || filters === null || Array.isArray(filters)) {
    return '篩選條件格式錯誤';
  }

  for (const key of Object.keys(filters)) {
    if (!VALID_FILTER_KEYS.has(key)) {
      return `不允許的篩選欄位: ${key}`;
    }
  }

  const f = filters as Record<string, unknown>;

  if (f.time_start !== undefined && typeof f.time_start !== 'string') return '無效的 time_start';
  if (f.time_end !== undefined && typeof f.time_end !== 'string') return '無效的 time_end';

  if (f.pattern !== undefined) {
    if (typeof f.pattern !== 'string' || f.pattern.length > 500)
      return '無效的 pattern（上限 500 字元）';
  }
  if (f.pattern_type !== undefined && f.pattern_type !== 'contains' && f.pattern_type !== 'regex') {
    return '無效的 pattern_type';
  }
  if (f.pattern_case_sensitive !== undefined && typeof f.pattern_case_sensitive !== 'boolean') {
    return '無效的 pattern_case_sensitive';
  }
  if (f.min_mentions !== undefined) {
    const n = Number(f.min_mentions);
    if (!Number.isInteger(n) || n < 0 || n > 20) return 'min_mentions 需為 0~20 的整數';
  }
  if (f.allow_duplicate !== undefined && typeof f.allow_duplicate !== 'boolean') {
    return '無效的 allow_duplicate';
  }
  if (f.duplicate_condition !== undefined && f.duplicate_condition !== 'unique_mentions') {
    return '無效的 duplicate_condition';
  }
  if (f.require_reaction !== undefined && typeof f.require_reaction !== 'boolean') {
    return '無效的 require_reaction';
  }
  if (f.allowed_reactions !== undefined) {
    if (!Array.isArray(f.allowed_reactions) || f.allowed_reactions.length > 10) {
      return '無效的 allowed_reactions';
    }
    const validReactions = new Set(['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY', 'CARE']);
    for (const r of f.allowed_reactions) {
      if (typeof r !== 'string' || !validReactions.has(r)) return `無效的反應類型: ${r}`;
    }
  }

  return null;
}

// 抽獎池 Entry
export interface DrawEntry {
  from_id: string;
  from_name: string;
  from_picture_url?: string;
  from_profile_url?: string; // Facebook 個人頁面連結
  comment_id: string;
  comment_message: string;
  comment_created_time: string;
}

export function toDrawEntry(comment: FacebookComment): DrawEntry | null {
  if (!comment.from?.id || !comment.from?.name) return null;

  return {
    from_id: comment.from.id,
    from_name: comment.from.name,
    from_picture_url: comment.from.picture?.data?.url,
    from_profile_url: comment.from.link,
    comment_id: comment.id,
    comment_message: comment.message,
    comment_created_time: comment.created_time,
  };
}

// 獎項
export interface PrizeInput {
  id: string; // 穩定的 React key，用於 list rendering
  name: string;
  quantity: number;
}

// 抽獎結果
export interface DrawResult {
  prize_id: string;
  prize_name: string;
  winner: DrawEntry;
}

// 抽獎活動
export type GiveawayStatus = 'DRAFT' | 'COMPLETED';

export interface GiveawayInput {
  name?: string;
  post_id: string;
  post_url?: string;
  filters: GiveawayFilters;
  prizes: PrizeInput[];
}

// 黑名單
export interface BlacklistEntry {
  from_id: string;
  from_name?: string;
  reason?: string;
}

// 篩選統計
export interface FilterStats {
  total_comments: number;
  after_time_filter: number;
  after_pattern_filter: number;
  after_mention_filter: number;
  after_reaction_filter: number; // 反應篩選後數量
  after_blacklist_filter: number;
  final_pool_size: number;
  unique_users: number;
}
