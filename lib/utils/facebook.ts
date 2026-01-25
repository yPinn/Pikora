/**
 * Facebook 相關工具函數
 */

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
