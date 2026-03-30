import { Shell } from '@/components/facebook/shell';
import { auth } from '@/lib/auth';
import { createFacebookService } from '@/lib/services/facebook';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 提前處理無權限狀態
  if (!session?.accessToken) {
    return <div>請先登入</div>;
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error('META_APP_ID and META_APP_SECRET environment variables are required');
  }

  const facebookService = createFacebookService({ appId, appSecret });

  const pages = await facebookService.getPages(session.accessToken, [
    'id',
    'name',
    'category',
    'tasks',
    'picture',
  ]);

  // Server side 取得 CDN 頭像 URL，避免將 accessToken 序列化至 RSC payload
  let avatarUrl = '';
  try {
    const res = await fetch(
      `https://graph.facebook.com/me/picture?type=square&redirect=false&access_token=${session.accessToken}`
    );
    if (res.ok) {
      const data = await res.json();
      avatarUrl = (data as { data?: { url?: string } }).data?.url ?? '';
    }
  } catch {
    // 取得失敗時使用空字串，UI 會顯示 fallback
  }

  const user = {
    name: session.user?.name ?? 'User',
    email: session.user?.email ?? '',
    avatarUrl,
  };

  return (
    <Shell pages={pages} user={user}>
      {children}
    </Shell>
  );
}
