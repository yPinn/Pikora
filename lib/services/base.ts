/**
 * Meta Graph API 基礎服務類別
 * 提供共用的 API 請求邏輯、錯誤處理、重試機制
 */

import {
  GRAPH_API_BASE_URL,
  type MetaApiError,
  type MetaApiErrorResponse,
  type ApiRequestOptions,
  type MetaServiceConfig,
  type RateLimitInfo,
  RETRYABLE_ERROR_CODES,
  TOKEN_EXPIRED_CODE,
  type TokenDebugInfo,
} from './types';

export class MetaApiBase {
  protected config: MetaServiceConfig;
  protected baseUrl: string;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: MetaServiceConfig, baseUrl: string = GRAPH_API_BASE_URL) {
    this.config = config;
    this.baseUrl = baseUrl;
  }

  /**
   * 取得當前速率限制資訊
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * 發送 API 請求
   */
  protected async request<T>(endpoint: string, options: ApiRequestOptions): Promise<T> {
    const { method = 'GET', params, body, accessToken, retries = 3 } = options;

    const url = new URL(`${this.baseUrl}${endpoint}`);

    // GET 請求: 所有參數放 URL
    // POST 請求: access_token 放 URL，其他參數放 body (form-urlencoded)
    url.searchParams.set('access_token', accessToken);

    const fetchOptions: RequestInit = { method };

    if (method === 'GET') {
      // GET: 參數放 URL query string
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.set(key, String(value));
          }
        });
      }
    } else if (method === 'POST') {
      // POST: 使用 form-urlencoded (Meta API 標準格式)
      fetchOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const formData = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.set(key, String(value));
          }
        });
      }
      if (body) {
        Object.entries(body).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          }
        });
      }
      fetchOptions.body = formData.toString();
    } else if (method === 'DELETE') {
      // DELETE: 參數放 URL
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.set(key, String(value));
          }
        });
      }
    }

    return this.executeWithRetry<T>(url.toString(), fetchOptions, retries);
  }

  /**
   * 帶有重試邏輯的請求執行
   */
  private async executeWithRetry<T>(
    url: string,
    options: RequestInit,
    maxRetries: number
  ): Promise<T> {
    let lastError: MetaApiError | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // 更新速率限制資訊
        const appUsage = response.headers.get('x-app-usage');
        if (appUsage) {
          try {
            this.rateLimitInfo = JSON.parse(appUsage);
          } catch {
            // 忽略解析錯誤
          }
        }

        const data = await response.json();

        // 檢查 API 錯誤
        if (this.isErrorResponse(data)) {
          const error = data.error;
          lastError = error;

          // Token 過期
          if (error.code === TOKEN_EXPIRED_CODE) {
            throw new MetaApiException(error, 'Token 已過期，請重新授權');
          }

          // 可重試的錯誤
          if (RETRYABLE_ERROR_CODES.includes(error.code)) {
            const delay = this.calculateBackoff(attempt);
            await this.sleep(delay);
            continue;
          }

          // 不可重試的錯誤
          throw new MetaApiException(error);
        }

        return data as T;
      } catch (error) {
        if (error instanceof MetaApiException) {
          throw error;
        }

        // 網路錯誤，重試
        if (attempt < maxRetries - 1) {
          const delay = this.calculateBackoff(attempt);
          await this.sleep(delay);
          continue;
        }

        throw new Error(`網路請求失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    }

    throw new MetaApiException(lastError!, '已達最大重試次數');
  }

  /**
   * 計算指數退避延遲
   */
  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000; // 1 秒
    const maxDelay = 30000; // 30 秒
    const jitter = Math.random() * 1000;
    return Math.min(Math.pow(2, attempt) * baseDelay + jitter, maxDelay);
  }

  /**
   * 延遲函數
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 檢查是否為錯誤回應
   */
  private isErrorResponse(data: unknown): data is MetaApiErrorResponse {
    return typeof data === 'object' && data !== null && 'error' in data;
  }

  /**
   * 驗證 Access Token
   */
  async debugToken(inputToken: string, accessToken?: string): Promise<TokenDebugInfo> {
    const appToken = accessToken || `${this.config.appId}|${this.config.appSecret}`;
    const response = await this.request<{ data: TokenDebugInfo }>('/debug_token', {
      params: { input_token: inputToken },
      accessToken: appToken,
    });
    return response.data;
  }

  /**
   * 延長短期 Token 為長期 Token
   */
  async exchangeToken(
    shortLivedToken: string
  ): Promise<{ access_token: string; token_type: string; expires_in?: number }> {
    return this.request('/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        fb_exchange_token: shortLivedToken,
      },
      accessToken: shortLivedToken,
    });
  }
}

/**
 * Meta API 例外類別
 */
export class MetaApiException extends Error {
  public readonly code: number;
  public readonly type: string;
  public readonly subcode?: number;
  public readonly fbtraceId: string;
  public readonly userTitle?: string;
  public readonly userMessage?: string;

  constructor(error: MetaApiError, customMessage?: string) {
    super(customMessage || error.message);
    this.name = 'MetaApiException';
    this.code = error.code;
    this.type = error.type;
    this.subcode = error.error_subcode;
    this.fbtraceId = error.fbtrace_id;
    this.userTitle = error.error_user_title;
    this.userMessage = error.error_user_msg;
  }

  /**
   * 檢查是否為速率限制錯誤
   */
  isRateLimitError(): boolean {
    return [4, 17, 32].includes(this.code);
  }

  /**
   * 檢查是否為 Token 錯誤
   */
  isTokenError(): boolean {
    return this.code === TOKEN_EXPIRED_CODE;
  }

  /**
   * 取得使用者友善的錯誤訊息
   */
  getUserFriendlyMessage(): string {
    if (this.userMessage) {
      return this.userMessage;
    }

    switch (this.code) {
      case 1:
        return '發生未知錯誤，請稍後再試';
      case 2:
        return '服務暫時無法使用，請稍後再試';
      case 4:
      case 17:
      case 32:
        return '請求過於頻繁，請稍後再試';
      case 100:
        return '參數錯誤，請檢查輸入';
      case 190:
        return '授權已過期，請重新登入';
      default:
        return this.message;
    }
  }
}
