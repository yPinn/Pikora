import { Shell } from '@/components/facebook/shell';
import { auth } from '@/lib/auth';
import { createFacebookService } from '@/lib/services/facebook';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 提前處理無權限狀態
  if (!session?.accessToken) {
    return <div>請先登入</div>;
  }

  const facebookService = createFacebookService({
    appId: process.env.META_APP_ID!,
    appSecret: process.env.META_APP_SECRET!,
  });

  const pages = await facebookService.getPages(session.accessToken, [
    'id',
    'name',
    'access_token',
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
