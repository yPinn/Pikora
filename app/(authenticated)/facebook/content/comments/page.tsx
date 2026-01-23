'use client';

import { PageHeader } from '@/components/common/page-header';
import { CommentList } from '@/components/facebook/comment-list';

export default function FacebookCommentsPage() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h2 className="text-lg font-semibold">留言管理</h2>
        <CommentList />
      </div>
    </>
  );
}
