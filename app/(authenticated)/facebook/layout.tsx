import { Shell } from '@/components/facebook/shell';
import { auth } from '@/lib/auth';
import { getComponentAccessToken } from '@/lib/auth/get-server-token';
import { createFacebookService } from '@/lib/services/facebook';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [session, accessToken] = await Promise.all([auth(), getComponentAccessToken()]);

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error('META_APP_ID and META_APP_SECRET environment variables are required');
  }

  const facebookService = createFacebookService({ appId, appSecret });

  const pages = await facebookService.getPages(accessToken, [
    'id',
    'name',
    'category',
    'tasks',
    'picture',
  ]);

  // session.user.image 是 OAuth 授權時由 Facebook 提供的頭像 CDN URL，不含 access token
  const user = {
    name: session.user.name ?? 'User',
    email: session.user.email ?? '',
    avatarUrl: session.user.image ?? '',
  };

  return (
    <Shell pages={pages} user={user}>
      {children}
    </Shell>
  );
}
