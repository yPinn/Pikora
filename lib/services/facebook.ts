/**
 * Facebook Pages API 服務
 * 處理粉絲專頁相關操作：貼文管理、留言、Insights 等
 */

import { MetaApiBase } from './base';
import { GRAPH_API_BASE_URL, type MetaServiceConfig, type PaginatedResponse } from './types';

// Facebook 專頁類型
export interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  category?: string;
  category_list?: { id: string; name: string }[];
  tasks?: string[];
  fan_count?: number;
  followers_count?: number;
  link?: string;
  picture?: {
    data: {
      url: string;
      width: number;
      height: number;
    };
  };
}

// 貼文類型
export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  updated_time?: string;
  permalink_url?: string;
  full_picture?: string;
  attachments?: {
    data: FacebookAttachment[];
  };
  shares?: {
    count: number;
  };
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  is_published?: boolean;
  scheduled_publish_time?: number;
}

export interface FacebookAttachment {
  type: string;
  media_type?: 'photo' | 'video' | 'link' | 'album' | string;
  url?: string;
  title?: string;
  description?: string;
  media?: {
    image?: { src: string; width?: number; height?: number };
    source?: string; // 影片來源 URL
  };
  subattachments?: {
    data: FacebookAttachment[];
  };
}

// 留言類型
export interface FacebookComment {
  id: string;
  message: string;
  created_time: string;
  from?: {
    id: string;
    name: string;
    picture?: {
      data: {
        url: string;
        is_silhouette?: boolean;
      };
    };
  };
  like_count?: number;
  comment_count?: number;
  attachment?: {
    type: string;
    url?: string;
    media?: {
      image?: { src: string };
    };
  };
  parent?: {
    id: string;
  };
  // 巢狀回覆
  comments?: {
    data: FacebookComment[];
  };
}

// 反應類型
export type ReactionType = 'LIKE' | 'LOVE' | 'WOW' | 'HAHA' | 'SAD' | 'ANGRY' | 'CARE';

export interface FacebookReaction {
  id: string;
  name: string;
  type: ReactionType;
  picture?: {
    data: {
      url: string;
    };
  };
}

// Insights 類型
export interface FacebookInsight {
  id: string;
  name: string;
  period: string;
  values: {
    value: number | Record<string, number>;
    end_time: string;
  }[];
  title: string;
  description: string;
}

// 發布貼文參數
export interface CreatePostParams {
  message?: string;
  link?: string;
  published?: boolean;
  scheduled_publish_time?: number;
  targeting?: {
    geo_locations?: {
      countries?: string[];
      cities?: { key: string }[];
    };
  };
}

// 發布媒體貼文參數
export interface CreateMediaPostParams extends CreatePostParams {
  url?: string; // 圖片/影片 URL
  source?: Blob; // 檔案上傳
}

/**
 * Facebook Pages API 服務類別
 */
export class FacebookService extends MetaApiBase {
  constructor(config: MetaServiceConfig) {
    super(config, GRAPH_API_BASE_URL);
  }

  // ==================== 專頁管理 ====================

  /**
   * 取得用戶管理的所有專頁
   */
  async getPages(
    userAccessToken: string,
    fields: string[] = ['id', 'name', 'access_token', 'category', 'tasks', 'picture']
  ): Promise<FacebookPage[]> {
    const response = await this.request<PaginatedResponse<FacebookPage>>('/me/accounts', {
      params: { fields: fields.join(',') },
      accessToken: userAccessToken,
    });
    return response.data;
  }

  /**
   * 取得專頁資訊
   */
  async getPage(
    pageId: string,
    accessToken: string,
    fields: string[] = ['id', 'name', 'fan_count', 'followers_count', 'link', 'picture']
  ): Promise<FacebookPage> {
    return this.request<FacebookPage>(`/${pageId}`, {
      params: { fields: fields.join(',') },
      accessToken,
    });
  }

  /**
   * 取得專頁 Access Token
   */
  async getPageAccessToken(pageId: string, userAccessToken: string): Promise<string> {
    const response = await this.request<{ access_token: string }>(`/${pageId}`, {
      params: { fields: 'access_token' },
      accessToken: userAccessToken,
    });
    return response.access_token;
  }

  // ==================== 貼文管理 ====================

  /**
   * 取得專頁貼文列表
   */
  async getPosts(
    pageId: string,
    accessToken: string,
    options: {
      fields?: string[];
      limit?: number;
      after?: string;
      before?: string;
    } = {}
  ): Promise<PaginatedResponse<FacebookPost>> {
    const {
      fields = [
        'id',
        'message',
        'created_time',
        'permalink_url',
        'full_picture',
        'attachments{type,media_type,media,subattachments{type,media_type,media}}',
        'shares',
        'reactions.summary(total_count)',
        'comments.summary(total_count)',
      ],
      limit = 25,
      after,
      before,
    } = options;

    return this.request<PaginatedResponse<FacebookPost>>(`/${pageId}/posts`, {
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
   * 取得單一貼文
   */
  async getPost(
    postId: string,
    accessToken: string,
    fields: string[] = [
      'id',
      'message',
      'created_time',
      'permalink_url',
      'full_picture',
      'shares',
      'reactions.summary(total_count)',
      'comments.summary(total_count)',
    ]
  ): Promise<FacebookPost> {
    return this.request<FacebookPost>(`/${postId}`, {
      params: { fields: fields.join(',') },
      accessToken,
    });
  }

  /**
   * 發布文字貼文
   */
  async createPost(
    pageId: string,
    pageAccessToken: string,
    params: CreatePostParams
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${pageId}/feed`, {
      method: 'POST',
      params: {
        message: params.message,
        link: params.link,
        published: params.published,
        scheduled_publish_time: params.scheduled_publish_time,
      },
      accessToken: pageAccessToken,
    });
  }

  /**
   * 發布圖片貼文
   */
  async createPhotoPost(
    pageId: string,
    pageAccessToken: string,
    params: CreateMediaPostParams
  ): Promise<{ id: string; post_id: string }> {
    return this.request<{ id: string; post_id: string }>(`/${pageId}/photos`, {
      method: 'POST',
      params: {
        url: params.url,
        message: params.message,
        published: params.published,
        scheduled_publish_time: params.scheduled_publish_time,
      },
      accessToken: pageAccessToken,
    });
  }

  /**
   * 發布影片貼文
   */
  async createVideoPost(
    pageId: string,
    pageAccessToken: string,
    params: CreateMediaPostParams & { title?: string; description?: string }
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${pageId}/videos`, {
      method: 'POST',
      params: {
        file_url: params.url,
        title: params.title,
        description: params.description || params.message,
        published: params.published,
        scheduled_publish_time: params.scheduled_publish_time,
      },
      accessToken: pageAccessToken,
    });
  }

  /**
   * 刪除貼文
   */
  async deletePost(postId: string, pageAccessToken: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/${postId}`, {
      method: 'DELETE',
      accessToken: pageAccessToken,
    });
  }

  // ==================== 留言管理 ====================

  /**
   * 取得貼文留言
   */
  async getComments(
    postId: string,
    accessToken: string,
    options: {
      fields?: string[];
      limit?: number;
      after?: string;
      filter?: 'toplevel' | 'stream';
      order?: 'chronological' | 'reverse_chronological';
    } = {}
  ): Promise<PaginatedResponse<FacebookComment>> {
    const {
      fields = [
        'id',
        'message',
        'created_time',
        'from{id,name,picture}',
        'like_count',
        'comment_count',
        'attachment',
        'parent{id}',
        // 巢狀回覆：最多支援 2 層 (Facebook API 限制)
        'comments{id,message,created_time,from{id,name,picture},like_count,comment_count,attachment,parent{id},comments{id,message,created_time,from{id,name,picture},like_count,attachment,parent{id}}}',
      ],
      limit = 100,
      after,
      filter = 'toplevel',
      order = 'chronological',
    } = options;

    return this.request<PaginatedResponse<FacebookComment>>(`/${postId}/comments`, {
      params: {
        fields: fields.join(','),
        limit,
        after,
        filter,
        order,
      },
      accessToken,
    });
  }

  /**
   * 取得所有留言（自動分頁）
   */
  async getAllComments(
    postId: string,
    accessToken: string,
    options: {
      fields?: string[];
      filter?: 'toplevel' | 'stream';
      maxPages?: number;
    } = {}
  ): Promise<FacebookComment[]> {
    const { maxPages = 100 } = options;
    const allComments: FacebookComment[] = [];
    let after: string | undefined;
    let pageCount = 0;

    do {
      const response = await this.getComments(postId, accessToken, {
        ...options,
        limit: 100,
        after,
      });

      allComments.push(...response.data);
      after = response.paging?.cursors?.after;
      pageCount++;
    } while (after && pageCount < maxPages);

    return allComments;
  }

  /**
   * 回覆留言
   */
  async replyToComment(
    commentId: string,
    pageAccessToken: string,
    message: string
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${commentId}/comments`, {
      method: 'POST',
      params: { message },
      accessToken: pageAccessToken,
    });
  }

  /**
   * 刪除留言
   */
  async deleteComment(commentId: string, pageAccessToken: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/${commentId}`, {
      method: 'DELETE',
      accessToken: pageAccessToken,
    });
  }

  /**
   * 隱藏留言
   */
  async hideComment(
    commentId: string,
    pageAccessToken: string,
    isHidden: boolean = true
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/${commentId}`, {
      method: 'POST',
      params: { is_hidden: isHidden },
      accessToken: pageAccessToken,
    });
  }

  // ==================== 反應管理 ====================

  /**
   * 取得貼文反應者列表
   */
  async getPostReactions(
    postId: string,
    accessToken: string,
    options: {
      fields?: string[];
      limit?: number;
      after?: string;
      type?: ReactionType;
    } = {}
  ): Promise<PaginatedResponse<FacebookReaction>> {
    const { fields = ['id', 'name', 'type', 'picture'], limit = 100, after, type } = options;

    const params: Record<string, string | number | boolean | undefined> = {
      fields: fields.join(','),
      limit,
      after,
    };

    // 只有在指定 type 時才加入參數
    if (type) {
      params.type = type;
    }

    return this.request<PaginatedResponse<FacebookReaction>>(`/${postId}/reactions`, {
      params,
      accessToken,
    });
  }

  /**
   * 取得所有反應者（自動分頁）
   */
  async getAllPostReactions(
    postId: string,
    accessToken: string,
    options: {
      fields?: string[];
      type?: ReactionType;
      maxPages?: number;
    } = {}
  ): Promise<FacebookReaction[]> {
    const { maxPages = 100 } = options;
    const allReactions: FacebookReaction[] = [];
    let after: string | undefined;
    let pageCount = 0;

    do {
      const response = await this.getPostReactions(postId, accessToken, {
        ...options,
        limit: 100,
        after,
      });

      allReactions.push(...response.data);
      after = response.paging?.cursors?.after;
      pageCount++;
    } while (after && pageCount < maxPages);

    return allReactions;
  }

  // ==================== Insights ====================

  /**
   * 取得專頁 Insights
   */
  async getPageInsights(
    pageId: string,
    pageAccessToken: string,
    options: {
      metric: string[];
      period?: 'day' | 'week' | 'days_28' | 'month' | 'lifetime';
      since?: Date;
      until?: Date;
    }
  ): Promise<FacebookInsight[]> {
    const { metric, period = 'day', since, until } = options;

    const response = await this.request<PaginatedResponse<FacebookInsight>>(`/${pageId}/insights`, {
      params: {
        metric: metric.join(','),
        period,
        since: since ? Math.floor(since.getTime() / 1000) : undefined,
        until: until ? Math.floor(until.getTime() / 1000) : undefined,
      },
      accessToken: pageAccessToken,
    });

    return response.data;
  }

  /**
   * 取得貼文 Insights
   */
  async getPostInsights(
    postId: string,
    pageAccessToken: string,
    metric: string[] = ['post_impressions', 'post_engaged_users', 'post_clicks']
  ): Promise<FacebookInsight[]> {
    const response = await this.request<PaginatedResponse<FacebookInsight>>(`/${postId}/insights`, {
      params: { metric: metric.join(',') },
      accessToken: pageAccessToken,
    });

    return response.data;
  }

  // ==================== 輔助方法 ====================

  /**
   * 解析貼文 ID 從 permalink URL
   */
  parsePostIdFromUrl(url: string): string | null {
    // Facebook 貼文 URL 格式:
    // https://www.facebook.com/{page}/posts/{post_id}
    // https://www.facebook.com/permalink.php?story_fbid={story_fbid}&id={page_id}

    const postsMatch = url.match(/\/posts\/(\d+)/);
    if (postsMatch) {
      return postsMatch[1];
    }

    const permalinkMatch = url.match(/story_fbid=(\d+)&id=(\d+)/);
    if (permalinkMatch) {
      return `${permalinkMatch[2]}_${permalinkMatch[1]}`;
    }

    return null;
  }

  /**
   * 驗證專頁存取權限
   */
  async verifyPageAccess(pageId: string, pageAccessToken: string): Promise<boolean> {
    try {
      await this.getPage(pageId, pageAccessToken, ['id']);
      return true;
    } catch {
      return false;
    }
  }
}

// 匯出預設實例工廠
export function createFacebookService(config: MetaServiceConfig): FacebookService {
  return new FacebookService(config);
}
