/**
 * Instagram Graph API 服務
 * 處理 Instagram 商業/創作者帳號操作：媒體管理、發布、留言、Insights 等
 */

import { MetaApiBase } from './base';
import {
  GRAPH_API_BASE_URL,
  type MetaServiceConfig,
  type PaginatedResponse,
  type MediaType,
  type PublishStatus,
} from './types';

// Instagram 帳號類型
export type InstagramAccountType = 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL';

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  account_type?: InstagramAccountType;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
  website?: string;
}

// 媒體類型
export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: MediaType;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  username?: string;
  like_count?: number;
  comments_count?: number;
  children?: {
    data: { id: string; media_type: MediaType; media_url?: string }[];
  };
}

// 留言類型
export interface InstagramComment {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  from?: {
    id: string;
    username: string;
  };
  like_count?: number;
  replies?: {
    data: InstagramComment[];
  };
  parent_id?: string;
}

// Insights 類型
export interface InstagramInsight {
  id: string;
  name: string;
  period: string;
  values: {
    value: number;
    end_time?: string;
  }[];
  title: string;
  description: string;
}

// 媒體容器狀態
export interface MediaContainerStatus {
  id: string;
  status_code: PublishStatus;
  status?: string;
}

// 發布圖片參數
export interface CreateImageParams {
  image_url: string;
  caption?: string;
  location_id?: string;
  user_tags?: { username: string; x: number; y: number }[];
  is_carousel_item?: boolean;
}

// 發布影片/Reels 參數
export interface CreateReelsParams {
  video_url: string;
  caption?: string;
  share_to_feed?: boolean;
  thumb_offset?: number; // 毫秒
  cover_url?: string;
  location_id?: string;
  audio_name?: string;
}

// 發布 Stories 參數
export interface CreateStoriesParams {
  image_url?: string;
  video_url?: string;
}

// 發布輪播參數
export interface CreateCarouselParams {
  children: string[]; // 子容器 ID 列表 (2-10 個)
  caption?: string;
  location_id?: string;
}

// 發布配額
export interface ContentPublishingLimit {
  quota_usage: number;
  config: {
    quota_total: number;
    quota_duration: number; // 秒
  };
}

/**
 * Instagram Graph API 服務類別
 */
export class InstagramService extends MetaApiBase {
  constructor(config: MetaServiceConfig) {
    super(config, GRAPH_API_BASE_URL);
  }

  // ==================== 帳號管理 ====================

  /**
   * 取得 Instagram 商業帳號資訊 (從 Facebook Page)
   */
  async getInstagramAccountFromPage(
    pageId: string,
    pageAccessToken: string
  ): Promise<{ instagram_business_account: { id: string } } | null> {
    try {
      return await this.request<{ instagram_business_account: { id: string } }>(`/${pageId}`, {
        params: { fields: 'instagram_business_account' },
        accessToken: pageAccessToken,
      });
    } catch {
      return null;
    }
  }

  /**
   * 取得帳號資訊
   */
  async getAccount(
    igUserId: string,
    accessToken: string,
    fields: string[] = [
      'id',
      'username',
      'name',
      'account_type',
      'profile_picture_url',
      'followers_count',
      'follows_count',
      'media_count',
      'biography',
    ]
  ): Promise<InstagramAccount> {
    return this.request<InstagramAccount>(`/${igUserId}`, {
      params: { fields: fields.join(',') },
      accessToken,
    });
  }

  // ==================== 媒體管理 ====================

  /**
   * 取得媒體列表
   */
  async getMedia(
    igUserId: string,
    accessToken: string,
    options: {
      fields?: string[];
      limit?: number;
      after?: string;
      before?: string;
    } = {}
  ): Promise<PaginatedResponse<InstagramMedia>> {
    const {
      fields = [
        'id',
        'caption',
        'media_type',
        'media_url',
        'thumbnail_url',
        'permalink',
        'timestamp',
        'like_count',
        'comments_count',
      ],
      limit = 25,
      after,
      before,
    } = options;

    return this.request<PaginatedResponse<InstagramMedia>>(`/${igUserId}/media`, {
      params: {
        fields: fields.join(','),
        limit,
        after,
        before,
      },
      accessToken,
    });
  }

  /**
   * 取得單一媒體詳情
   */
  async getMediaDetails(
    mediaId: string,
    accessToken: string,
    fields: string[] = [
      'id',
      'caption',
      'media_type',
      'media_url',
      'thumbnail_url',
      'permalink',
      'timestamp',
      'like_count',
      'comments_count',
      'children{id,media_type,media_url}',
    ]
  ): Promise<InstagramMedia> {
    return this.request<InstagramMedia>(`/${mediaId}`, {
      params: { fields: fields.join(',') },
      accessToken,
    });
  }

  // ==================== 內容發布 ====================

  /**
   * 建立圖片容器
   */
  async createImageContainer(
    igUserId: string,
    accessToken: string,
    params: CreateImageParams
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${igUserId}/media`, {
      method: 'POST',
      params: {
        image_url: params.image_url,
        caption: params.caption,
        location_id: params.location_id,
        is_carousel_item: params.is_carousel_item,
      },
      accessToken,
    });
  }

  /**
   * 建立 Reels 容器
   */
  async createReelsContainer(
    igUserId: string,
    accessToken: string,
    params: CreateReelsParams
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${igUserId}/media`, {
      method: 'POST',
      params: {
        video_url: params.video_url,
        caption: params.caption,
        media_type: 'REELS',
        share_to_feed: params.share_to_feed ?? true,
        thumb_offset: params.thumb_offset,
        cover_url: params.cover_url,
        location_id: params.location_id,
        audio_name: params.audio_name,
      },
      accessToken,
    });
  }

  /**
   * 建立 Stories 容器
   */
  async createStoriesContainer(
    igUserId: string,
    accessToken: string,
    params: CreateStoriesParams
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${igUserId}/media`, {
      method: 'POST',
      params: {
        image_url: params.image_url,
        video_url: params.video_url,
        media_type: 'STORIES',
      },
      accessToken,
    });
  }

  /**
   * 建立輪播容器
   */
  async createCarouselContainer(
    igUserId: string,
    accessToken: string,
    params: CreateCarouselParams
  ): Promise<{ id: string }> {
    if (params.children.length < 2 || params.children.length > 10) {
      throw new Error('輪播必須包含 2-10 個子項目');
    }

    return this.request<{ id: string }>(`/${igUserId}/media`, {
      method: 'POST',
      params: {
        media_type: 'CAROUSEL',
        children: params.children.join(','),
        caption: params.caption,
        location_id: params.location_id,
      },
      accessToken,
    });
  }

  /**
   * 檢查容器狀態
   */
  async getContainerStatus(
    containerId: string,
    accessToken: string
  ): Promise<MediaContainerStatus> {
    return this.request<MediaContainerStatus>(`/${containerId}`, {
      params: { fields: 'id,status_code,status' },
      accessToken,
    });
  }

  /**
   * 等待容器準備完成
   */
  async waitForContainer(
    containerId: string,
    accessToken: string,
    options: { maxAttempts?: number; intervalMs?: number } = {}
  ): Promise<MediaContainerStatus> {
    const { maxAttempts = 30, intervalMs = 5000 } = options;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getContainerStatus(containerId, accessToken);

      if (status.status_code === 'FINISHED') {
        return status;
      }

      if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
        throw new Error(`容器處理失敗: ${status.status || status.status_code}`);
      }

      // IN_PROGRESS，等待後重試
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('等待容器處理超時');
  }

  /**
   * 發布容器
   */
  async publishContainer(
    igUserId: string,
    accessToken: string,
    containerId: string
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${igUserId}/media_publish`, {
      method: 'POST',
      params: { creation_id: containerId },
      accessToken,
    });
  }

  /**
   * 發布圖片（完整流程）
   */
  async publishImage(
    igUserId: string,
    accessToken: string,
    params: CreateImageParams
  ): Promise<{ id: string }> {
    // 1. 建立容器
    const container = await this.createImageContainer(igUserId, accessToken, params);

    // 2. 等待準備完成
    await this.waitForContainer(container.id, accessToken);

    // 3. 發布
    return this.publishContainer(igUserId, accessToken, container.id);
  }

  /**
   * 發布 Reels（完整流程）
   */
  async publishReels(
    igUserId: string,
    accessToken: string,
    params: CreateReelsParams
  ): Promise<{ id: string }> {
    // 1. 建立容器
    const container = await this.createReelsContainer(igUserId, accessToken, params);

    // 2. 等待準備完成（影片處理需要更長時間）
    await this.waitForContainer(container.id, accessToken, {
      maxAttempts: 60,
      intervalMs: 10000,
    });

    // 3. 發布
    return this.publishContainer(igUserId, accessToken, container.id);
  }

  /**
   * 發布輪播（完整流程）
   */
  async publishCarousel(
    igUserId: string,
    accessToken: string,
    items: CreateImageParams[],
    caption?: string
  ): Promise<{ id: string }> {
    if (items.length < 2 || items.length > 10) {
      throw new Error('輪播必須包含 2-10 個項目');
    }

    // 1. 建立所有子容器
    const childContainerIds: string[] = [];
    for (const item of items) {
      const container = await this.createImageContainer(igUserId, accessToken, {
        ...item,
        is_carousel_item: true,
      });
      childContainerIds.push(container.id);
    }

    // 2. 等待所有子容器準備完成
    await Promise.all(childContainerIds.map((id) => this.waitForContainer(id, accessToken)));

    // 3. 建立輪播容器
    const carouselContainer = await this.createCarouselContainer(igUserId, accessToken, {
      children: childContainerIds,
      caption,
    });

    // 4. 等待輪播容器準備完成
    await this.waitForContainer(carouselContainer.id, accessToken);

    // 5. 發布
    return this.publishContainer(igUserId, accessToken, carouselContainer.id);
  }

  /**
   * 檢查發布配額
   */
  async getContentPublishingLimit(
    igUserId: string,
    accessToken: string
  ): Promise<ContentPublishingLimit> {
    return this.request<ContentPublishingLimit>(`/${igUserId}/content_publishing_limit`, {
      params: { fields: 'quota_usage,config' },
      accessToken,
    });
  }

  // ==================== 留言管理 ====================

  /**
   * 取得媒體留言
   */
  async getComments(
    mediaId: string,
    accessToken: string,
    options: {
      fields?: string[];
      limit?: number;
      after?: string;
    } = {}
  ): Promise<PaginatedResponse<InstagramComment>> {
    const {
      fields = ['id', 'text', 'timestamp', 'username', 'like_count', 'from'],
      limit = 50,
      after,
    } = options;

    return this.request<PaginatedResponse<InstagramComment>>(`/${mediaId}/comments`, {
      params: {
        fields: fields.join(','),
        limit,
        after,
      },
      accessToken,
    });
  }

  /**
   * 取得所有留言（自動分頁）
   */
  async getAllComments(
    mediaId: string,
    accessToken: string,
    options: { maxPages?: number } = {}
  ): Promise<InstagramComment[]> {
    const { maxPages = 100 } = options;
    const allComments: InstagramComment[] = [];
    let after: string | undefined;
    let pageCount = 0;

    do {
      const response = await this.getComments(mediaId, accessToken, {
        limit: 50,
        after,
      });

      allComments.push(...response.data);
      after = response.paging?.cursors?.after;
      pageCount++;
    } while (after && pageCount < maxPages);

    return allComments;
  }

  /**
   * 取得留言的回覆
   */
  async getCommentReplies(
    commentId: string,
    accessToken: string,
    fields: string[] = ['id', 'text', 'timestamp', 'username', 'like_count']
  ): Promise<PaginatedResponse<InstagramComment>> {
    return this.request<PaginatedResponse<InstagramComment>>(`/${commentId}/replies`, {
      params: { fields: fields.join(',') },
      accessToken,
    });
  }

  /**
   * 回覆留言
   */
  async replyToComment(
    mediaId: string,
    accessToken: string,
    commentId: string,
    message: string
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${mediaId}/comments`, {
      method: 'POST',
      params: {
        message,
        reply_to_comment_id: commentId,
      },
      accessToken,
    });
  }

  /**
   * 刪除留言
   */
  async deleteComment(commentId: string, accessToken: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/${commentId}`, {
      method: 'DELETE',
      accessToken,
    });
  }

  /**
   * 隱藏留言
   */
  async hideComment(
    commentId: string,
    accessToken: string,
    hide: boolean = true
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/${commentId}`, {
      method: 'POST',
      params: { hide },
      accessToken,
    });
  }

  // ==================== Insights ====================

  /**
   * 取得帳號 Insights
   */
  async getAccountInsights(
    igUserId: string,
    accessToken: string,
    options: {
      metric: string[];
      period?: 'day' | 'week' | 'days_28' | 'lifetime';
      since?: Date;
      until?: Date;
    }
  ): Promise<InstagramInsight[]> {
    const { metric, period = 'day', since, until } = options;

    const response = await this.request<PaginatedResponse<InstagramInsight>>(
      `/${igUserId}/insights`,
      {
        params: {
          metric: metric.join(','),
          period,
          since: since ? Math.floor(since.getTime() / 1000) : undefined,
          until: until ? Math.floor(until.getTime() / 1000) : undefined,
        },
        accessToken,
      }
    );

    return response.data;
  }

  /**
   * 取得媒體 Insights
   * 注意: v22.0 變更 - 2024/7/2 後建立的媒體應使用 'views' 而非 'impressions'
   */
  async getMediaInsights(
    mediaId: string,
    accessToken: string,
    metric: string[] = ['engagement', 'reach', 'saved', 'views']
  ): Promise<InstagramInsight[]> {
    const response = await this.request<PaginatedResponse<InstagramInsight>>(
      `/${mediaId}/insights`,
      {
        params: { metric: metric.join(',') },
        accessToken,
      }
    );

    return response.data;
  }

  // ==================== 輔助方法 ====================

  /**
   * 解析媒體 ID 從 Instagram URL
   */
  parseMediaIdFromUrl(url: string): string | null {
    // Instagram URL 格式:
    // https://www.instagram.com/p/{shortcode}/
    // https://www.instagram.com/reel/{shortcode}/

    const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * 驗證帳號存取權限
   */
  async verifyAccountAccess(igUserId: string, accessToken: string): Promise<boolean> {
    try {
      await this.getAccount(igUserId, accessToken, ['id']);
      return true;
    } catch {
      return false;
    }
  }
}

// 匯出預設實例工廠
export function createInstagramService(config: MetaServiceConfig): InstagramService {
  return new InstagramService(config);
}
