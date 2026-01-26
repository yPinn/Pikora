'use client';

import { Bell } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { Card } from '@/components/ui/card';

export default function FacebookNotifyPage() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h2 className="text-lg font-semibold">通知發送</h2>
        <Card className="flex flex-col items-center justify-center py-16">
          <Bell className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
          <p className="text-muted-foreground text-sm">功能開發中</p>
        </Card>
      </div>
    </>
  );
}
