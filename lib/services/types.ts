/**
 * Meta Graph API 共用類型定義
 */

// API 版本
export const META_API_VERSION = 'v22.0';
export const GRAPH_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;
export const INSTAGRAM_API_BASE_URL = `https://graph.instagram.com/${META_API_VERSION}`;

// Token 類型
export type TokenType = 'user' | 'page' | 'app' | 'system_user' | 'client';

export interface AccessToken {
  token: string;
  type: TokenType;
  expiresAt?: Date;
  scopes?: string[];
}

export interface TokenDebugInfo {
  app_id: string;
  type: string;
  application: string;
  data_access_expires_at: number;
  expires_at: number;
  is_valid: boolean;
  scopes: string[];
  user_id: string;
}

// 分頁
export interface PaginationCursors {
  before?: string;
  after?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  paging?: {
    cursors?: PaginationCursors;
    next?: string;
    previous?: string;
  };
}

// 錯誤處理
export interface MetaApiError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  error_user_title?: string;
  error_user_msg?: string;
  fbtrace_id: string;
}

export interface MetaApiErrorResponse {
  error: MetaApiError;
}

// 可重試的錯誤碼
export const RETRYABLE_ERROR_CODES = [1, 2, 4, 17, 32];
export const TOKEN_EXPIRED_CODE = 190;

// 速率限制
export interface RateLimitInfo {
  call_count: number;
  total_cputime: number;
  total_time: number;
}

// 基礎媒體類型
export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS' | 'STORIES';

// 發布狀態
export type PublishStatus = 'FINISHED' | 'IN_PROGRESS' | 'ERROR' | 'EXPIRED';

// 通用回應
export interface BasicResponse {
  success: boolean;
  id?: string;
}

// Webhook 相關
export interface WebhookEntry {
  id: string;
  time: number;
  changes?: WebhookChange[];
  messaging?: WebhookMessaging[];
}

export interface WebhookChange {
  field: string;
  value: Record<string, unknown>;
}

export interface WebhookMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: unknown[];
  };
}

export interface WebhookPayload {
  object: 'page' | 'instagram' | 'user';
  entry: WebhookEntry[];
}

// API 請求選項
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
  accessToken: string;
  retries?: number;
}

// 服務配置
export interface MetaServiceConfig {
  appId: string;
  appSecret: string;
  defaultAccessToken?: string;
}
