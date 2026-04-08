/**
 * Facebook 相關工具函數
 */

export const FACEBOOK_ID_PATTERN = /^\d{1,30}$/;

/**
 * 從 URL 解析 Facebook 貼文 ID
 * 支援格式：
 * - pageId_postId (直接 ID)
 * - https://www.facebook.com/{pageId}/posts/{postId}
 * - https://www.facebook.com/permalink.php?story_fbid={postId}&id={pageId}
 */
export function extractPostIdFromUrl(url: string, pageId?: string): string | null {
  if (!url) return null;

  // 已經是 pageId_postId 格式
  if (url.includes('_') && /^\d+_\d+$/.test(url)) {
    return url;
  }

  // https://www.facebook.com/{pageId}/posts/{postId}
  const postsMatch = url.match(/\/posts\/(\d+)/);
  if (postsMatch) {
    return pageId ? `${pageId}_${postsMatch[1]}` : postsMatch[1];
  }

  // https://www.facebook.com/permalink.php?story_fbid={postId}&id={pageId}
  const storyMatch = url.match(/story_fbid=(\d+)/);
  if (storyMatch) {
    return pageId ? `${pageId}_${storyMatch[1]}` : storyMatch[1];
  }

  return null;
}

/**
 * 建構 Facebook 留言連結
 * 使用 URL API 正確附加 comment_id，避免 post_url 已含 query string 時產生雙重 ?
 */
export function buildCommentUrl(postUrl: string, commentId: string): string {
  try {
    const url = new URL(postUrl);
    url.searchParams.set('comment_id', commentId);
    return url.toString();
  } catch {
    return `${postUrl}?comment_id=${commentId}`;
  }
}

/**
 * 解析 Facebook API 錯誤訊息為使用者友善提示
 */
export function parseFacebookErrorMessage(error: string): string {
  if (error.includes('does not exist') || error.includes('cannot be loaded')) {
    return '該貼文不存在、已被刪除，或沒有權限查看。';
  }
  if (error.includes('permission') || error.includes('Permission')) {
    return '權限不足，請確認已授權相關權限。';
  }
  if (error.includes('token') || error.includes('Token') || error.includes('Session')) {
    return '授權已過期，請重新登入。';
  }
  return '無法取得資料，請確認輸入是否正確。';
}

/** 允許的 Facebook 圖片 CDN 網域（與 next.config.ts remotePatterns 一致） */
const ALLOWED_FB_CDN_HOSTNAMES = [
  // fbcdn.net 允許任意深度的 subdomain（如 scontent-nrt1-1.xx.fbcdn.net）
  /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+fbcdn\.net$/,
  /^platform-lookaside\.fbsbx\.com$/,
  /^lookaside\.fbsbx\.com$/,
  /^graph\.facebook\.com$/,
];

/**
 * 驗證 URL 是否來自 Facebook 允許的圖片 CDN
 * 避免渲染任意來源的圖片 URL
 */
export function isFacebookCdnUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'https:') return false;
    return ALLOWED_FB_CDN_HOSTNAMES.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

/**
 * 驗證 URL 是否為可公開存取的 HTTPS URL（用於 Instagram/Threads 媒體發布）
 * 阻擋私有 IP 範圍，防止將內部位址轉發給外部 API。
 */
export function isValidPublicMediaUrl(url: string | undefined): boolean {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  const hostname = parsed.hostname;
  // 阻擋 localhost 與私有 IP 範圍（IPv4）
  if (
    hostname === 'localhost' ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname === '0.0.0.0' ||
    hostname === '::1'
  ) {
    return false;
  }
  return true;
}

/**
 * 判斷是否為匿名參與者（無 Facebook 帳號資訊）
 * 匿名用戶以 "anon_" 為 userId 前綴。
 */
export function isAnonymousUser(userId: string): boolean {
  return userId.startsWith('anon_');
}

/**
 * 建構 Facebook 頭像代理路徑
 * 回傳相對路徑；元件中用 apiPath() 包裹即可。
 */
export function facebookPictureUrl(userId: string, pageId?: string): string {
  const base = `/api/facebook/picture?userId=${userId}`;
  return pageId ? `${base}&pageId=${pageId}` : base;
}

/**
 * 驗證 URL 是否為 Facebook 個人頁面連結（用於 href）
 */
export function isFacebookProfileUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && /^(?:www\.)?facebook\.com$/.test(hostname);
  } catch {
    return false;
  }
}

/**
 * 根據 parent.id 重建正確的留言樹狀結構
 *
 * Facebook API 可能將「回覆的回覆」錯誤地放在第一層回覆下，
 * 此函數根據每則留言的 parent.id 欄位重新建構正確的巢狀關係。
 *
 * @param topLevelComments 頂層留言陣列（從 API 取得）
 * @returns 重建後的留言樹狀陣列
 */
export function rebuildCommentTree<
  T extends { id: string; parent?: { id: string }; comments?: { data: T[] } },
>(topLevelComments: T[]): T[] {
  // 收集所有留言（包括巢狀的）到 Map
  const allComments = new Map<string, T>();
  const topLevelIds = new Set<string>();

  // 遞迴收集所有留言
  function collectComments(comments: T[], isTopLevel = false) {
    for (const comment of comments) {
      allComments.set(comment.id, { ...comment, comments: undefined } as T);
      if (isTopLevel) {
        topLevelIds.add(comment.id);
      }
      if (comment.comments?.data) {
        collectComments(comment.comments.data as T[], false);
      }
    }
  }

  collectComments(topLevelComments, true);

  // 根據 parent.id 重建樹狀結構
  const result: T[] = [];
  const childrenMap = new Map<string, T[]>();

  for (const [, comment] of allComments) {
    const parentId = comment.parent?.id;

    if (!parentId || topLevelIds.has(comment.id)) {
      // 頂層留言
      result.push(comment);
    } else {
      // 子留言：加入對應父留言的 children 陣列
      const children = childrenMap.get(parentId);
      if (children) {
        children.push(comment);
      } else {
        childrenMap.set(parentId, [comment]);
      }
    }
  }

  // 將子留言掛回父留言的 comments.data
  function attachChildren(comment: T): T {
    const children = childrenMap.get(comment.id);
    if (children && children.length > 0) {
      // 遞迴處理子留言的子留言
      const processedChildren = children.map(attachChildren);
      return {
        ...comment,
        comments: { data: processedChildren },
      };
    }
    return comment;
  }

  return result.map(attachChildren);
}
