'use client';

import { PageHeader } from '@/components/common/page-header';
import { PostList } from '@/components/facebook/post-list';

export default function FacebookDashboardPage() {
  return (
    <>
      <PageHeader />
      <div className="gap-page p-page flex flex-1 flex-col pt-0">
        <h2 className="text-heading font-semibold">貼文內容</h2>
        <PostList />
      </div>
    </>
  );
}
