import { describe, expect, it } from 'vitest';

import {
  extractPostIdFromUrl,
  isFacebookCdnUrl,
  isFacebookProfileUrl,
  isAnonymousUser,
  isValidPublicMediaUrl,
  parseFacebookErrorMessage,
  rebuildCommentTree,
} from '@/lib/utils/facebook';

// ── extractPostIdFromUrl ──────────────────────────────────────────────────────

describe('extractPostIdFromUrl', () => {
  it('空字串回傳 null', () => {
    expect(extractPostIdFromUrl('')).toBeNull();
  });

  it('pageId_postId 格式直接回傳', () => {
    expect(extractPostIdFromUrl('123456_789012')).toBe('123456_789012');
  });

  it('/posts/{postId} URL 不帶 pageId 時只回傳 postId', () => {
    expect(extractPostIdFromUrl('https://www.facebook.com/MyPage/posts/987654')).toBe('987654');
  });

  it('/posts/{postId} URL 帶 pageId 時組合回傳', () => {
    expect(extractPostIdFromUrl('https://www.facebook.com/MyPage/posts/987654', '111111')).toBe(
      '111111_987654'
    );
  });

  it('permalink.php story_fbid URL 不帶 pageId 時只回傳 postId', () => {
    expect(
      extractPostIdFromUrl('https://www.facebook.com/permalink.php?story_fbid=555555&id=222222')
    ).toBe('555555');
  });

  it('permalink.php story_fbid URL 帶 pageId 時組合回傳', () => {
    expect(
      extractPostIdFromUrl(
        'https://www.facebook.com/permalink.php?story_fbid=555555&id=222222',
        '333333'
      )
    ).toBe('333333_555555');
  });

  it('無法辨識的 URL 回傳 null', () => {
    expect(extractPostIdFromUrl('https://www.facebook.com/groups/123')).toBeNull();
  });

  it('非 Facebook URL 回傳 null', () => {
    expect(extractPostIdFromUrl('https://example.com/foo')).toBeNull();
  });
});

// ── parseFacebookErrorMessage ─────────────────────────────────────────────────

describe('parseFacebookErrorMessage', () => {
  it('does not exist → 貼文不存在提示', () => {
    expect(parseFacebookErrorMessage('does not exist')).toContain('不存在');
  });

  it('cannot be loaded → 貼文不存在提示', () => {
    expect(parseFacebookErrorMessage('cannot be loaded')).toContain('不存在');
  });

  it('permission error → 權限不足提示', () => {
    expect(parseFacebookErrorMessage('permission denied')).toContain('權限');
  });

  it('Permission（大寫）error → 權限不足提示', () => {
    expect(parseFacebookErrorMessage('Permission denied')).toContain('權限');
  });

  it('token error → 授權過期提示', () => {
    expect(parseFacebookErrorMessage('invalid token')).toContain('授權');
  });

  it('Token（大寫）error → 授權過期提示', () => {
    expect(parseFacebookErrorMessage('Token expired')).toContain('授權');
  });

  it('Session error → 授權過期提示', () => {
    expect(parseFacebookErrorMessage('Session expired')).toContain('授權');
  });

  it('未知錯誤 → 通用提示', () => {
    expect(parseFacebookErrorMessage('some unknown error')).toContain('無法取得資料');
  });
});

// ── isFacebookCdnUrl ──────────────────────────────────────────────────────────

describe('isFacebookCdnUrl', () => {
  it('undefined 回傳 false', () => {
    expect(isFacebookCdnUrl(undefined)).toBe(false);
  });

  it('空字串回傳 false', () => {
    expect(isFacebookCdnUrl('')).toBe(false);
  });

  it('http:// 非 https 回傳 false', () => {
    expect(isFacebookCdnUrl('http://static.xx.fbcdn.net/img.jpg')).toBe(false);
  });

  it('fbcdn.net subdomain 被接受', () => {
    expect(isFacebookCdnUrl('https://scontent.fbcdn.net/img.jpg')).toBe(true);
  });

  it('platform-lookaside.fbsbx.com 被接受', () => {
    expect(isFacebookCdnUrl('https://platform-lookaside.fbsbx.com/img.jpg')).toBe(true);
  });

  it('lookaside.fbsbx.com 被接受', () => {
    expect(isFacebookCdnUrl('https://lookaside.fbsbx.com/img.jpg')).toBe(true);
  });

  it('graph.facebook.com 被接受', () => {
    expect(isFacebookCdnUrl('https://graph.facebook.com/123/picture')).toBe(true);
  });

  it('不允許的域名回傳 false', () => {
    expect(isFacebookCdnUrl('https://evil.com/img.jpg')).toBe(false);
  });

  it('無效 URL 回傳 false', () => {
    expect(isFacebookCdnUrl('not-a-url')).toBe(false);
  });
});

// ── isValidPublicMediaUrl ─────────────────────────────────────────────────────

describe('isValidPublicMediaUrl', () => {
  it('undefined 回傳 false', () => {
    expect(isValidPublicMediaUrl(undefined)).toBe(false);
  });

  it('空字串回傳 false', () => {
    expect(isValidPublicMediaUrl('')).toBe(false);
  });

  it('http:// URL 回傳 false', () => {
    expect(isValidPublicMediaUrl('http://example.com/img.jpg')).toBe(false);
  });

  it('https:// 公開 URL 回傳 true', () => {
    expect(isValidPublicMediaUrl('https://cdn.example.com/media.jpg')).toBe(true);
  });

  it('localhost 被阻擋', () => {
    expect(isValidPublicMediaUrl('https://localhost/img.jpg')).toBe(false);
  });

  it('127.x.x.x 被阻擋', () => {
    expect(isValidPublicMediaUrl('https://127.0.0.1/img.jpg')).toBe(false);
  });

  it('10.x.x.x 被阻擋', () => {
    expect(isValidPublicMediaUrl('https://10.0.0.1/img.jpg')).toBe(false);
  });

  it('192.168.x.x 被阻擋', () => {
    expect(isValidPublicMediaUrl('https://192.168.1.1/img.jpg')).toBe(false);
  });

  it('172.16.x.x 被阻擋（私有 IP）', () => {
    expect(isValidPublicMediaUrl('https://172.16.0.1/img.jpg')).toBe(false);
  });

  it('172.31.x.x 被阻擋（私有 IP 上限）', () => {
    expect(isValidPublicMediaUrl('https://172.31.255.255/img.jpg')).toBe(false);
  });

  it('172.15.x.x 不被阻擋（非私有 IP）', () => {
    expect(isValidPublicMediaUrl('https://172.15.0.1/img.jpg')).toBe(true);
  });

  it('0.0.0.0 被阻擋', () => {
    expect(isValidPublicMediaUrl('https://0.0.0.0/img.jpg')).toBe(false);
  });

  it('::1（IPv6 loopback）被阻擋', () => {
    expect(isValidPublicMediaUrl('https://::1/img.jpg')).toBe(false);
  });

  it('無效 URL 回傳 false', () => {
    expect(isValidPublicMediaUrl('not-a-url')).toBe(false);
  });
});

// ── isAnonymousUser ───────────────────────────────────────────────────────────

describe('isAnonymousUser', () => {
  it('anon_ 前綴回傳 true', () => {
    expect(isAnonymousUser('anon_abc123')).toBe(true);
  });

  it('anon_ 加 comment id 回傳 true', () => {
    expect(isAnonymousUser('anon_1234567890')).toBe(true);
  });

  it('一般數字 userId 回傳 false', () => {
    expect(isAnonymousUser('123456789')).toBe(false);
  });

  it('空字串回傳 false', () => {
    expect(isAnonymousUser('')).toBe(false);
  });

  it('anon 無底線不符合回傳 false', () => {
    expect(isAnonymousUser('anon')).toBe(false);
  });
});

// ── isFacebookProfileUrl ─────────────────────────────────────────────────────

describe('isFacebookProfileUrl', () => {
  it('undefined 回傳 false', () => {
    expect(isFacebookProfileUrl(undefined)).toBe(false);
  });

  it('空字串回傳 false', () => {
    expect(isFacebookProfileUrl('')).toBe(false);
  });

  it('https://www.facebook.com/user 被接受', () => {
    expect(isFacebookProfileUrl('https://www.facebook.com/user.name')).toBe(true);
  });

  it('https://facebook.com/user 被接受（無 www）', () => {
    expect(isFacebookProfileUrl('https://facebook.com/user.name')).toBe(true);
  });

  it('http:// facebook URL 被拒絕', () => {
    expect(isFacebookProfileUrl('http://www.facebook.com/user')).toBe(false);
  });

  it('非 facebook.com 域名被拒絕', () => {
    expect(isFacebookProfileUrl('https://evil.com/facebook')).toBe(false);
  });

  it('無效 URL 回傳 false', () => {
    expect(isFacebookProfileUrl('not-a-url')).toBe(false);
  });
});

// ── rebuildCommentTree ────────────────────────────────────────────────────────

type SimpleComment = {
  id: string;
  parent?: { id: string };
  comments?: { data: SimpleComment[] };
};

describe('rebuildCommentTree', () => {
  it('空陣列回傳空陣列', () => {
    expect(rebuildCommentTree([])).toEqual([]);
  });

  it('無子留言的頂層留言維持原樣', () => {
    const comments: SimpleComment[] = [{ id: 'c1' }, { id: 'c2' }];
    const result = rebuildCommentTree(comments);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(expect.arrayContaining(['c1', 'c2']));
  });

  it('子留言被正確掛到父留言', () => {
    const comments: SimpleComment[] = [
      {
        id: 'c1',
        comments: {
          data: [{ id: 'c1r1', parent: { id: 'c1' } }],
        },
      },
    ];
    const result = rebuildCommentTree(comments);
    expect(result).toHaveLength(1);
    expect(result[0].comments?.data).toHaveLength(1);
    expect(result[0].comments?.data[0].id).toBe('c1r1');
  });

  it('錯誤的巢狀位置依 parent.id 重建', () => {
    // c2r1 的 parent 是 c1，但被錯誤放在 c2 的 replies 下
    const comments: SimpleComment[] = [
      { id: 'c1' },
      {
        id: 'c2',
        comments: {
          data: [{ id: 'c2r1', parent: { id: 'c1' } }], // 應屬於 c1
        },
      },
    ];
    const result = rebuildCommentTree(comments);
    const c1 = result.find((c) => c.id === 'c1');
    const c2 = result.find((c) => c.id === 'c2');
    // c2r1 應被移到 c1 底下
    expect(c1?.comments?.data.map((c) => c.id)).toContain('c2r1');
    // c2 應無子留言
    expect(c2?.comments).toBeUndefined();
  });

  it('頂層留言不因有 parent 欄位而被移除', () => {
    // 頂層留言不應因有 parent 欄位（ID 在 topLevelIds 中）而被誤判為子留言
    const comments: SimpleComment[] = [{ id: 'c1', parent: { id: 'c0' } }, { id: 'c2' }];
    const result = rebuildCommentTree(comments);
    expect(result.map((c) => c.id)).toContain('c1');
    expect(result.map((c) => c.id)).toContain('c2');
  });
});
