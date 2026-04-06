import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiPath } from '@/lib/utils';
import { facebookPictureUrl } from '@/lib/utils/facebook';

interface FacebookAvatarProps {
  userId: string;
  name: string;
  pageId?: string;
  /** sm = h-8 w-8 (default)  md = h-10 w-10 */
  size?: 'sm' | 'md';
}

export function FacebookAvatar({ userId, name, pageId, size = 'sm' }: FacebookAvatarProps) {
  return (
    <Avatar className={size === 'md' ? 'h-10 w-10' : 'h-8 w-8'}>
      <AvatarImage src={apiPath(facebookPictureUrl(userId, pageId))} />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  );
}
