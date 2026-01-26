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
}

// 抽獎池 Entry
export interface DrawEntry {
  from_id: string;
  from_name: string;
  from_picture_url?: string;
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
    comment_id: comment.id,
    comment_message: comment.message,
    comment_created_time: comment.created_time,
  };
}

// 獎項
export interface PrizeInput {
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
  after_blacklist_filter: number;
  final_pool_size: number;
  unique_users: number;
}
