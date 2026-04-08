import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiPath } from '@/lib/utils';
import { facebookPictureUrl, isFacebookCdnUrl, isAnonymousUser } from '@/lib/utils/facebook';

const ANON_AVATAR_COUNT = 10;

interface FacebookAvatarProps {
  /** Facebook user ID. `undefined` = 身份不明（顯示名稱首字或 '?'）；`'anon_*'` = 匿名（顯示隨機頭像）。 */
  userId?: string;
  name: string;
  pageId?: string;
  /** Direct picture URL from comment data (from.picture.data.url). Takes priority over the proxy API. */
  pictureUrl?: string;
  /** sm = h-8 w-8 (default)  md = h-10 w-10 */
  size?: 'sm' | 'md';
}

/** Derive a stable index (0–max-1) from an arbitrary string. */
function hashIndex(str: string, max: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % max;
  }
  return h;
}

export function FacebookAvatar({
  userId,
  name,
  pageId,
  pictureUrl,
  size = 'sm',
}: FacebookAvatarProps) {
  const sizeClass = size === 'md' ? 'size-10' : 'size-8';

  // 身份不明（comment 無 from 欄位）→ 名稱首字 fallback
  if (!userId) {
    return (
      <Avatar className={sizeClass}>
        <AvatarFallback>{name[0] || '?'}</AvatarFallback>
      </Avatar>
    );
  }

  // 匿名參與者（有追蹤 ID 但無 Facebook 帳號）→ 隨機 momonga 頭像
  if (isAnonymousUser(userId)) {
    const idx = hashIndex(userId, ANON_AVATAR_COUNT) + 1;
    return (
      <Avatar className={sizeClass}>
        <AvatarImage alt="" src={apiPath(`/images/Momonga_${idx}.jpg`)} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  // 一般用戶：CDN 直連 URL 需驗證來源，否則 fallback 走 proxy API
  const src = isFacebookCdnUrl(pictureUrl)
    ? pictureUrl
    : apiPath(facebookPictureUrl(userId, pageId));

  return (
    <Avatar className={sizeClass}>
      <AvatarImage alt="" src={src} />
      <AvatarFallback>{name[0] || '?'}</AvatarFallback>
    </Avatar>
  );
}
