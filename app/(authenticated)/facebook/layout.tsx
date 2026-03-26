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

  return (
    <Shell pages={pages} session={session}>
      {children}
    </Shell>
  );
}
