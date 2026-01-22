'use client';

import { PageHeader } from '@/components/common/page-header';
import { PostList } from '@/components/facebook/post-list';

export default function FacebookDashboardPage() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h2 className="text-lg font-semibold">貼文內容</h2>
        <PostList />
      </div>
    </>
  );
}
