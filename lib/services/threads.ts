/**
 * Threads API 服務
 * 處理 Threads 帳號操作：貼文管理、發布、回覆、Insights 等
 *
 * Threads API 基於 Instagram Graph API，需要 Instagram 商業/創作者帳號
 * API 文件: https://developers.facebook.com/docs/threads
 */

import { MetaApiBase } from './base';
import { GRAPH_API_BASE_URL, type MetaServiceConfig, type PaginatedResponse } from './types';

// Threads 帳號類型
export interface ThreadsProfile {
  id: string;
  username: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
}

// Threads 媒體類型
export type ThreadsMediaType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL';

// Threads 貼文類型
export interface ThreadsPost {
  id: string;
  text?: string;
  media_type: ThreadsMediaType;
  media_url?: string;
  permalink: string;
  timestamp: string;
  username?: string;
  shortcode?: string;
  thumbnail_url?: string;
  children?: {
    data: { id: string; media_type: ThreadsMediaType; media_url?: string }[];
  };
  is_quote_post?: boolean;
  has_replies?: boolean;
  root_post?: { id: string };
  replied_to?: { id: string };
  is_reply?: boolean;
  hide_status?: 'NOT_HUSHED' | 'UNHUSHED' | 'HIDDEN' | 'COVERED';
  reply_audience?: 'EVERYONE' | 'ACCOUNTS_YOU_FOLLOW' | 'MENTIONED_ONLY';
}

// Threads 回覆類型
export interface ThreadsReply extends ThreadsPost {
  replied_to: { id: string };
}

// 發布狀態
export type ThreadsPublishStatus = 'FINISHED' | 'IN_PROGRESS' | 'ERROR' | 'EXPIRED' | 'PUBLISHED';

// 媒體容器狀態
export interface ThreadsContainerStatus {
  id: string;
  status: ThreadsPublishStatus;
  error_message?: string;
}

// Insights 類型
export interface ThreadsInsight {
  id: string;
  name: string;
  period: string;
  values: {
    value: number;
  }[];
  title: string;
  description: string;
}

// 發布文字貼文參數
export interface CreateTextPostParams {
  text: string;
  reply_to_id?: string;
  reply_control?: 'everyone' | 'accounts_you_follow' | 'mentioned_only';
  allowlisted_country_codes?: string[];
  link_attachment?: string;
}

// 發布圖片貼文參數
export interface CreateImagePostParams extends Omit<CreateTextPostParams, 'link_attachment'> {
  image_url: string;
  is_carousel_item?: boolean;
  alt_text?: string;
}

// 發布影片貼文參數
export interface CreateVideoPostParams extends Omit<CreateTextPostParams, 'link_attachment'> {
  video_url: string;
  is_carousel_item?: boolean;
  alt_text?: string;
}

// 發布輪播參數
export interface CreateCarouselPostParams {
  children: string[]; // 子容器 ID 列表 (2-20 個)
  text?: string;
  reply_to_id?: string;
  reply_control?: 'everyone' | 'accounts_you_follow' | 'mentioned_only';
}

// 發布配額
export interface ThreadsPublishingLimit {
  quota_usage: number;
  config: {
    quota_total: number;
    quota_duration: number;
  };
  reply_quota_usage?: number;
  reply_config?: {
    quota_total: number;
    quota_duration: number;
  };
}

/**
 * Threads API 服務類別
 */
export class ThreadsService extends MetaApiBase {
  constructor(config: MetaServiceConfig) {
    super(config, GRAPH_API_BASE_URL);
  }

  // ==================== 帳號管理 ====================

  /**
   * 取得 Threads 帳號資訊
   */
  async getProfile(
    threadsUserId: string,
    accessToken: string,
    fields: string[] = ['id', 'username', 'threads_profile_picture_url', 'threads_biography']
  ): Promise<ThreadsProfile> {
    return this.request<ThreadsProfile>(`/${threadsUserId}`, {
      params: { fields: fields.join(',') },
      accessToken,
    });
  }

  // ==================== 貼文管理 ====================

  /**
   * 取得用戶的 Threads 貼文列表
   */
  async getPosts(
    threadsUserId: string,
    accessToken: string,
    options: {
      fields?: string[];
      limit?: number;
      since?: Date;
      until?: Date;
      after?: string;
      before?: string;
    } = {}
  ): Promise<PaginatedResponse<ThreadsPost>> {
    const {
      fields = [
        'id',
        'text',
        'media_type',
        'media_url',
        'permalink',
        'timestamp',
        'username',
        'shortcode',
        'is_quote_post',
        'has_replies',
      ],
      limit = 25,
      since,
      until,
      after,
      before,
    } = options;

    return this.request<PaginatedResponse<ThreadsPost>>(`/${threadsUserId}/threads`, {
      params: {
        fields: fields.join(','),
        limit,
        since: since ? Math.floor(since.getTime() / 1000) : undefined,
        until: until ? Math.floor(until.getTime() / 1000) : undefined,
        after,
        before,
      },
      accessToken,
    });
  }

  /**
   * 取得單一貼文詳情
   */
  async getPost(
    mediaId: string,
    accessToken: string,
    fields: string[] = [
      'id',
      'text',
      'media_type',
      'media_url',
      'permalink',
      'timestamp',
      'username',
      'shortcode',
      'thumbnail_url',
      'children',
      'is_quote_post',
      'has_replies',
      'root_post',
      'replied_to',
      'is_reply',
      'hide_status',
      'reply_audience',
    ]
  ): Promise<ThreadsPost> {
    return this.request<ThreadsPost>(`/${mediaId}`, {
      params: { fields: fields.join(',') },
      accessToken,
    });
  }

  // ==================== 內容發布 ====================

  /**
   * 建立文字貼文容器
   */
  async createTextContainer(
    threadsUserId: string,
    accessToken: string,
    params: CreateTextPostParams
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${threadsUserId}/threads`, {
      method: 'POST',
      params: {
        media_type: 'TEXT',
        text: params.text,
        reply_to_id: params.reply_to_id,
        reply_control: params.reply_control,
        allowlisted_country_codes: params.allowlisted_country_codes?.join(','),
        link_attachment: params.link_attachment,
      },
      accessToken,
    });
  }

  /**
   * 建立圖片貼文容器
   */
  async createImageContainer(
    threadsUserId: string,
    accessToken: string,
    params: CreateImagePostParams
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${threadsUserId}/threads`, {
      method: 'POST',
      params: {
        media_type: 'IMAGE',
        image_url: params.image_url,
        text: params.text,
        is_carousel_item: params.is_carousel_item,
        alt_text: params.alt_text,
        reply_to_id: params.reply_to_id,
        reply_control: params.reply_control,
      },
      accessToken,
    });
  }

  /**
   * 建立影片貼文容器
   */
  async createVideoContainer(
    threadsUserId: string,
    accessToken: string,
    params: CreateVideoPostParams
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${threadsUserId}/threads`, {
      method: 'POST',
      params: {
        media_type: 'VIDEO',
        video_url: params.video_url,
        text: params.text,
        is_carousel_item: params.is_carousel_item,
        alt_text: params.alt_text,
        reply_to_id: params.reply_to_id,
        reply_control: params.reply_control,
      },
      accessToken,
    });
  }

  /**
   * 建立輪播貼文容器
   */
  async createCarouselContainer(
    threadsUserId: string,
    accessToken: string,
    params: CreateCarouselPostParams
  ): Promise<{ id: string }> {
    if (params.children.length < 2 || params.children.length > 20) {
      throw new Error('輪播必須包含 2-20 個子項目');
    }

    return this.request<{ id: string }>(`/${threadsUserId}/threads`, {
      method: 'POST',
      params: {
        media_type: 'CAROUSEL',
        children: params.children.join(','),
        text: params.text,
        reply_to_id: params.reply_to_id,
        reply_control: params.reply_control,
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
  ): Promise<ThreadsContainerStatus> {
    return this.request<ThreadsContainerStatus>(`/${containerId}`, {
      params: { fields: 'id,status,error_message' },
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
  ): Promise<ThreadsContainerStatus> {
    const { maxAttempts = 30, intervalMs = 5000 } = options;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getContainerStatus(containerId, accessToken);

      if (status.status === 'FINISHED') {
        return status;
      }

      if (status.status === 'ERROR' || status.status === 'EXPIRED') {
        throw new Error(`容器處理失敗: ${status.error_message || status.status}`);
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
    threadsUserId: string,
    accessToken: string,
    containerId: string
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${threadsUserId}/threads_publish`, {
      method: 'POST',
      params: { creation_id: containerId },
      accessToken,
    });
  }

  /**
   * 發布文字貼文（完整流程）
   */
  async publishTextPost(
    threadsUserId: string,
    accessToken: string,
    params: CreateTextPostParams
  ): Promise<{ id: string }> {
    // 1. 建立容器
    const container = await this.createTextContainer(threadsUserId, accessToken, params);

    // 2. 文字貼文不需要等待處理

    // 3. 發布
    return this.publishContainer(threadsUserId, accessToken, container.id);
  }

  /**
   * 發布圖片貼文（完整流程）
   */
  async publishImagePost(
    threadsUserId: string,
    accessToken: string,
    params: CreateImagePostParams
  ): Promise<{ id: string }> {
    // 1. 建立容器
    const container = await this.createImageContainer(threadsUserId, accessToken, params);

    // 2. 等待準備完成
    await this.waitForContainer(container.id, accessToken);

    // 3. 發布
    return this.publishContainer(threadsUserId, accessToken, container.id);
  }

  /**
   * 發布影片貼文（完整流程）
   */
  async publishVideoPost(
    threadsUserId: string,
    accessToken: string,
    params: CreateVideoPostParams
  ): Promise<{ id: string }> {
    // 1. 建立容器
    const container = await this.createVideoContainer(threadsUserId, accessToken, params);

    // 2. 等待準備完成（影片處理需要更長時間）
    await this.waitForContainer(container.id, accessToken, {
      maxAttempts: 60,
      intervalMs: 10000,
    });

    // 3. 發布
    return this.publishContainer(threadsUserId, accessToken, container.id);
  }

  /**
   * 發布輪播貼文（完整流程）
   */
  async publishCarouselPost(
    threadsUserId: string,
    accessToken: string,
    items: (CreateImagePostParams | CreateVideoPostParams)[],
    text?: string
  ): Promise<{ id: string }> {
    if (items.length < 2 || items.length > 20) {
      throw new Error('輪播必須包含 2-20 個項目');
    }

    // 1. 建立所有子容器
    const childContainerIds: string[] = [];
    for (const item of items) {
      let container: { id: string };

      if ('image_url' in item) {
        container = await this.createImageContainer(threadsUserId, accessToken, {
          ...item,
          is_carousel_item: true,
        });
      } else {
        container = await this.createVideoContainer(threadsUserId, accessToken, {
          ...item,
          is_carousel_item: true,
        });
      }

      childContainerIds.push(container.id);
    }

    // 2. 等待所有子容器準備完成
    await Promise.all(childContainerIds.map((id) => this.waitForContainer(id, accessToken)));

    // 3. 建立輪播容器
    const carouselContainer = await this.createCarouselContainer(threadsUserId, accessToken, {
      children: childContainerIds,
      text,
    });

    // 4. 發布
    return this.publishContainer(threadsUserId, accessToken, carouselContainer.id);
  }

  /**
   * 檢查發布配額
   */
  async getPublishingLimit(
    threadsUserId: string,
    accessToken: string
  ): Promise<ThreadsPublishingLimit> {
    return this.request<ThreadsPublishingLimit>(`/${threadsUserId}/threads_publishing_limit`, {
      params: { fields: 'quota_usage,config,reply_quota_usage,reply_config' },
      accessToken,
    });
  }

  // ==================== 回覆管理 ====================

  /**
   * 取得貼文的回覆
   */
  async getReplies(
    mediaId: string,
    accessToken: string,
    options: {
      fields?: string[];
      reverse?: boolean;
      after?: string;
      before?: string;
    } = {}
  ): Promise<PaginatedResponse<ThreadsReply>> {
    const {
      fields = [
        'id',
        'text',
        'media_type',
        'media_url',
        'permalink',
        'timestamp',
        'username',
        'replied_to',
        'hide_status',
      ],
      reverse = false,
      after,
      before,
    } = options;

    return this.request<PaginatedResponse<ThreadsReply>>(`/${mediaId}/replies`, {
      params: {
        fields: fields.join(','),
        reverse,
        after,
        before,
      },
      accessToken,
    });
  }

  /**
   * 取得對話串（conversation）
   */
  async getConversation(
    mediaId: string,
    accessToken: string,
    options: {
      fields?: string[];
      reverse?: boolean;
      after?: string;
      before?: string;
    } = {}
  ): Promise<PaginatedResponse<ThreadsPost>> {
    const {
      fields = [
        'id',
        'text',
        'media_type',
        'media_url',
        'permalink',
        'timestamp',
        'username',
        'replied_to',
        'is_reply',
      ],
      reverse = false,
      after,
      before,
    } = options;

    return this.request<PaginatedResponse<ThreadsPost>>(`/${mediaId}/conversation`, {
      params: {
        fields: fields.join(','),
        reverse,
        after,
        before,
      },
      accessToken,
    });
  }

  /**
   * 回覆貼文
   */
  async replyToPost(
    threadsUserId: string,
    accessToken: string,
    replyToId: string,
    text: string
  ): Promise<{ id: string }> {
    return this.publishTextPost(threadsUserId, accessToken, {
      text,
      reply_to_id: replyToId,
    });
  }

  /**
   * 隱藏回覆
   */
  async hideReply(
    replyId: string,
    accessToken: string,
    hide: boolean = true
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/${replyId}/manage_reply`, {
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
    threadsUserId: string,
    accessToken: string,
    options: {
      metric?: string[];
      since?: Date;
      until?: Date;
    } = {}
  ): Promise<ThreadsInsight[]> {
    const {
      metric = ['views', 'likes', 'replies', 'reposts', 'quotes', 'followers_count'],
      since,
      until,
    } = options;

    const response = await this.request<PaginatedResponse<ThreadsInsight>>(
      `/${threadsUserId}/threads_insights`,
      {
        params: {
          metric: metric.join(','),
          since: since ? Math.floor(since.getTime() / 1000) : undefined,
          until: until ? Math.floor(until.getTime() / 1000) : undefined,
        },
        accessToken,
      }
    );

    return response.data;
  }

  /**
   * 取得貼文 Insights
   */
  async getPostInsights(
    mediaId: string,
    accessToken: string,
    metric: string[] = ['views', 'likes', 'replies', 'reposts', 'quotes']
  ): Promise<ThreadsInsight[]> {
    const response = await this.request<PaginatedResponse<ThreadsInsight>>(`/${mediaId}/insights`, {
      params: { metric: metric.join(',') },
      accessToken,
    });

    return response.data;
  }

  // ==================== 輔助方法 ====================

  /**
   * 解析貼文 ID 從 Threads URL
   */
  parsePostIdFromUrl(url: string): string | null {
    // Threads URL 格式:
    // https://www.threads.net/@username/post/{shortcode}
    // https://www.threads.net/t/{shortcode}

    const match = url.match(/threads\.net\/(?:@[\w.]+\/post\/|t\/)([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * 驗證帳號存取權限
   */
  async verifyAccountAccess(threadsUserId: string, accessToken: string): Promise<boolean> {
    try {
      await this.getProfile(threadsUserId, accessToken, ['id']);
      return true;
    } catch {
      return false;
    }
  }
}

// 匯出預設實例工廠
export function createThreadsService(config: MetaServiceConfig): ThreadsService {
  return new ThreadsService(config);
}
