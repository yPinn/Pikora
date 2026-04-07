import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiPath } from '@/lib/utils';
import { facebookPictureUrl, isAnonymousUser } from '@/lib/utils/facebook';

const ANON_AVATAR_COUNT = 10;

interface FacebookAvatarProps {
  userId: string;
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

  if (isAnonymousUser(userId)) {
    const idx = hashIndex(userId, ANON_AVATAR_COUNT) + 1;
    return (
      <Avatar className={sizeClass}>
        <AvatarImage alt="" src={`/images/Momonga_${idx}.jpg`} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  // Use embedded picture URL from comment data if available; otherwise proxy through API
  const src = pictureUrl ?? apiPath(facebookPictureUrl(userId, pageId));

  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={src} />
      <AvatarFallback>{name[0] || '?'}</AvatarFallback>
    </Avatar>
  );
}
