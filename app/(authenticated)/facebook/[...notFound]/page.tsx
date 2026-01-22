import Link from 'next/link';

import { PageHeader } from '@/components/common/page-header';

export default function FacebookNotFoundPage() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">找不到此頁面</p>
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href="/facebook/content/posts"
        >
          返回貼文管理
        </Link>
      </div>
    </>
  );
}
