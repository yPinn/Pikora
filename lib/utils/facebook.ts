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
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(comment);
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
